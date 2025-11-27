/**
 * Utility functions for shutdown service
 */

import os from "os";

/**
 * Get the local IP address of this machine
 * This is the IP the mobile app needs to connect to
 *
 * When connected to phone hotspot, look for the WiFi adapter's IPv4 address
 */
export const getLocalIPAddress = (): string => {
  const interfaces = os.networkInterfaces();

  // Priority order for finding the right interface
  const priorityInterfaces = [
    "Wi-Fi",
    "WiFi",
    "Wireless",
    "wlan",
    "WLAN",
    "eth",
    "Ethernet",
  ];

  // First, try to find a prioritized interface
  for (const priority of priorityInterfaces) {
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (name.toLowerCase().includes(priority.toLowerCase()) && addrs) {
        for (const addr of addrs) {
          if (addr.family === "IPv4" && !addr.internal) {
            return addr.address;
          }
        }
      }
    }
  }

  // Fallback: find any non-internal IPv4 address
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (addrs) {
      for (const addr of addrs) {
        if (addr.family === "IPv4" && !addr.internal) {
          return addr.address;
        }
      }
    }
  }

  return "127.0.0.1"; // Last resort fallback
};

/**
 * Validate IP address format
 */
export const isValidIP = (ip: string): boolean => {
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * Simple logging utility
 */
export const log = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data || "");
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || "");
  },
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data || "");
  },
};
