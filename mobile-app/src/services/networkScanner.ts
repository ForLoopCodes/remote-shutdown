/**
 * Network Scanner Service
 *
 * Scans the local network to find devices connected to the hotspot.
 * Can find all reachable devices or specifically those running the shutdown service.
 */

import axios from "axios";

export interface DiscoveredDevice {
  ip: string;
  port: number;
  hostname?: string;
  responseTime: number;
  hasService: boolean; // Whether the shutdown service is running
}

/**
 * Get the local IP prefix from common hotspot ranges
 */
const getHotspotPrefixes = (): string[] => {
  // Common private network ranges used by mobile hotspots
  return [
    "192.168.43", // Android hotspot default
    "192.168.137", // Windows mobile hotspot
    "192.168.49", // Some Android versions
  ];
};

/**
 * Check if an IP is reachable by trying to connect
 */
const isIPReachable = async (
  ip: string,
  timeout: number = 300
): Promise<boolean> => {
  try {
    // Try common ports to see if device responds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Try to fetch - even a connection refused means the IP exists
    const response = await fetch(`http://${ip}:80/`, {
      method: "HEAD",
      signal: controller.signal,
    }).catch((e) => {
      // Connection refused or other network error means IP exists
      if (e.name !== "AbortError") {
        return { ok: false, exists: true };
      }
      return { ok: false, exists: false };
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ping-like check using TCP connection attempt
 */
const pingIP = async (
  ip: string,
  timeout: number = 500
): Promise<{ reachable: boolean; responseTime: number }> => {
  const startTime = Date.now();

  try {
    // Try multiple common ports
    const ports = [80, 443, 3000, 8080, 22, 445];

    const checks = ports.map(async (port) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        await fetch(`http://${ip}:${port}/`, {
          method: "HEAD",
          signal: controller.signal,
          mode: "no-cors",
        });

        clearTimeout(timeoutId);
        return true;
      } catch (e: any) {
        // If it's not an abort error, the device exists (connection refused = device exists)
        return e.name !== "AbortError";
      }
    });

    const results = await Promise.race([
      Promise.any(checks),
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), timeout)
      ),
    ]);

    return {
      reachable: results === true,
      responseTime: Date.now() - startTime,
    };
  } catch {
    return { reachable: false, responseTime: Date.now() - startTime };
  }
};

/**
 * Check if a specific IP:port has the shutdown service running
 */
const checkServiceAtIP = async (
  ip: string,
  port: number,
  timeout: number = 1500
): Promise<DiscoveredDevice | null> => {
  const startTime = Date.now();
  try {
    const response = await axios.get(`http://${ip}:${port}/health`, {
      timeout,
    });

    if (response.data && response.data.status === "ok") {
      return {
        ip,
        port,
        hostname: response.data.hostname,
        responseTime: Date.now() - startTime,
        hasService: true,
      };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Scan for ALL devices on the network running the shutdown service
 */
export const scanAllDevices = async (
  onProgress?: (progress: number, found: DiscoveredDevice[]) => void,
  port: number = 3000,
  timeout: number = 1000
): Promise<DiscoveredDevice[]> => {
  const prefixes = getHotspotPrefixes();
  const foundDevices: DiscoveredDevice[] = [];
  const totalIPs = prefixes.length * 254;
  let scannedCount = 0;

  for (const prefix of prefixes) {
    const batchSize = 50;
    for (let start = 1; start <= 254; start += batchSize) {
      const batch: Promise<DiscoveredDevice | null>[] = [];

      for (let i = start; i < Math.min(start + batchSize, 255); i++) {
        const ip = `${prefix}.${i}`;
        batch.push(checkServiceAtIP(ip, port, timeout));
      }

      const results = await Promise.all(batch);
      results.forEach((result) => {
        if (result) {
          foundDevices.push(result);
        }
      });

      scannedCount += batch.length;
      onProgress?.(scannedCount / totalIPs, foundDevices);
    }
  }

  return foundDevices.sort((a, b) => a.responseTime - b.responseTime);
};

/**
 * Scan a range of IPs for the shutdown service
 */
export const scanNetwork = async (
  onProgress?: (progress: number, found: DiscoveredDevice[]) => void,
  port: number = 3000,
  timeout: number = 1500
): Promise<DiscoveredDevice[]> => {
  const prefixes = getHotspotPrefixes();
  const foundDevices: DiscoveredDevice[] = [];
  const totalIPs = prefixes.length * 255;
  let scannedCount = 0;

  for (const prefix of prefixes) {
    const batchSize = 20;
    for (let start = 1; start <= 255; start += batchSize) {
      const batch: Promise<DiscoveredDevice | null>[] = [];

      for (let i = start; i < Math.min(start + batchSize, 256); i++) {
        const ip = `${prefix}.${i}`;
        batch.push(checkServiceAtIP(ip, port, timeout));
      }

      const results = await Promise.all(batch);
      results.forEach((result) => {
        if (result) {
          foundDevices.push(result);
        }
      });

      scannedCount += batch.length;
      onProgress?.(scannedCount / totalIPs, foundDevices);
    }
  }

  return foundDevices.sort((a, b) => a.responseTime - b.responseTime);
};

/**
 * Quick scan - only scan the most common hotspot ranges
 * Does NOT auto-select - always returns all found devices
 */
export const quickScan = async (
  onProgress?: (progress: number, found: DiscoveredDevice[]) => void,
  port: number = 3000,
  timeout: number = 1000
): Promise<DiscoveredDevice[]> => {
  const quickPrefixes = [
    "192.168.43", // Android hotspot
    "192.168.137", // Windows hotspot
    "192.168.49", // Some Android
  ];

  const foundDevices: DiscoveredDevice[] = [];
  const totalIPs = quickPrefixes.length * 255;
  let scannedCount = 0;

  for (const prefix of quickPrefixes) {
    const batchSize = 30;
    for (let start = 1; start <= 255; start += batchSize) {
      const batch: Promise<DiscoveredDevice | null>[] = [];

      for (let i = start; i < Math.min(start + batchSize, 256); i++) {
        const ip = `${prefix}.${i}`;
        batch.push(checkServiceAtIP(ip, port, timeout));
      }

      const results = await Promise.all(batch);
      results.forEach((result) => {
        if (result) {
          foundDevices.push(result);
        }
      });

      scannedCount += batch.length;
      onProgress?.(scannedCount / totalIPs, foundDevices);
    }
  }

  return foundDevices.sort((a, b) => a.responseTime - b.responseTime);
};

/**
 * Scan a specific subnet
 */
export const scanSubnet = async (
  prefix: string,
  onProgress?: (progress: number, found: DiscoveredDevice[]) => void,
  port: number = 3000,
  timeout: number = 1500
): Promise<DiscoveredDevice[]> => {
  const foundDevices: DiscoveredDevice[] = [];
  let scannedCount = 0;

  const batchSize = 25;
  for (let start = 1; start <= 255; start += batchSize) {
    const batch: Promise<DiscoveredDevice | null>[] = [];

    for (let i = start; i < Math.min(start + batchSize, 256); i++) {
      const ip = `${prefix}.${i}`;
      batch.push(checkServiceAtIP(ip, port, timeout));
    }

    const results = await Promise.all(batch);
    results.forEach((result) => {
      if (result) {
        foundDevices.push(result);
      }
    });

    scannedCount += batch.length;
    onProgress?.(scannedCount / 255, foundDevices);
  }

  return foundDevices;
};

/**
 * Test a specific IP address
 */
export const testConnection = async (
  ip: string,
  port: number = 3000
): Promise<DiscoveredDevice | null> => {
  return checkServiceAtIP(ip, port, 3000);
};

/**
 * Scan ALL devices connected to hotspot (reachable IPs)
 * This finds any device, not just those running the shutdown service
 */
export const scanHotspotDevices = async (
  onProgress?: (progress: number, found: DiscoveredDevice[]) => void,
  port: number = 3000
): Promise<DiscoveredDevice[]> => {
  const prefixes = getHotspotPrefixes();
  const foundDevices: DiscoveredDevice[] = [];

  // Only scan first 20 IPs of each prefix (hotspots usually assign low IPs)
  const maxIP = 30;
  const totalIPs = prefixes.length * maxIP;
  let scannedCount = 0;

  for (const prefix of prefixes) {
    const batchSize = 10;

    for (let start = 1; start <= maxIP; start += batchSize) {
      const batch: Promise<{ ip: string; result: DiscoveredDevice | null }>[] =
        [];

      for (let i = start; i < Math.min(start + batchSize, maxIP + 1); i++) {
        const ip = `${prefix}.${i}`;
        batch.push(
          checkServiceAtIP(ip, port, 800).then((result) => ({ ip, result }))
        );
      }

      const results = await Promise.all(batch);

      for (const { result } of results) {
        if (result) {
          foundDevices.push(result);
        }
      }

      scannedCount += batch.length;
      onProgress?.(scannedCount / totalIPs, foundDevices);
    }
  }

  return foundDevices.sort((a, b) => a.responseTime - b.responseTime);
};
