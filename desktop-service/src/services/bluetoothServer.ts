/**
 * Bluetooth Server Service
 *
 * Creates an RFCOMM (SPP - Serial Port Profile) server that listens for
 * incoming Bluetooth connections and processes shutdown commands.
 *
 * PROTOCOL:
 * - Commands are sent as: "action:key:options"
 * - Example: "shutdown:mysecretkey:delay=30,force=true"
 * - Responses are JSON: {"success": true, "message": "..."}
 *
 * SETUP:
 * 1. Make sure Windows Bluetooth is enabled
 * 2. Pair your phone with the PC via Windows Bluetooth settings
 * 3. The server will advertise an SPP service
 *
 * NOTE: bluetooth-serial-port requires native build tools (node-gyp, Visual Studio Build Tools)
 * Run: npm install --global windows-build-tools (as admin)
 * Then: npm install bluetooth-serial-port
 */

import os from "os";
import {
  shutdownSystem,
  restartSystem,
  sleepSystem,
  hibernateSystem,
  logoutSystem,
  cancelShutdown,
  getSystemInfo,
} from "./systemService";

// Type definitions for bluetooth-serial-port (may not have types installed)
interface BluetoothDevice {
  address: string;
  name: string;
  services?: string[];
}

interface BluetoothServerOptions {
  uuid?: string;
  channel?: number;
}

// Bluetooth server configuration
const BT_CONFIG = {
  // Service Name (what appears during pairing/discovery)
  serviceName: "Remote PC Shutdown",
  // UUID for Serial Port Profile (SPP)
  uuid: "00001101-0000-1000-8000-00805F9B34FB",
  // RFCOMM Channel
  channel: 1,
};

interface BluetoothCommand {
  action: string;
  key: string;
  options: Record<string, string>;
}

/**
 * Parse incoming Bluetooth command string
 * Format: "action:key:option1=value1,option2=value2"
 */
function parseCommand(data: string): BluetoothCommand | null {
  try {
    const trimmed = data.trim();
    const parts = trimmed.split(":");

    if (parts.length < 2) {
      return null;
    }

    const action = parts[0].toLowerCase();
    const key = parts[1];
    const optionsStr = parts[2] || "";

    // Parse options
    const options: Record<string, string> = {};
    if (optionsStr) {
      const optionPairs = optionsStr.split(",");
      for (const pair of optionPairs) {
        const [optKey, optValue] = pair.split("=");
        if (optKey && optValue !== undefined) {
          options[optKey.trim()] = optValue.trim();
        }
      }
    }

    return { action, key, options };
  } catch (error) {
    console.error("[BT] Error parsing command:", error);
    return null;
  }
}

/**
 * Create JSON response string
 */
function createResponse(
  success: boolean,
  message: string,
  extra?: object
): string {
  return (
    JSON.stringify({
      success,
      message,
      ...extra,
    }) + "\n"
  ); // Add newline for message framing
}

/**
 * Process a command and return the response
 */
async function processCommand(
  commandStr: string,
  secretKey: string
): Promise<string> {
  console.log(`[BT] Processing command: ${commandStr}`);

  // Parse the command
  const command = parseCommand(commandStr);
  if (!command) {
    return createResponse(
      false,
      "Invalid command format. Use: action:key:options"
    );
  }

  // Validate secret key
  if (command.key !== secretKey) {
    console.log("[BT] Authentication failed: Invalid key");
    return createResponse(false, "Authentication failed: Invalid key");
  }

  // Parse options
  const delay = parseInt(command.options.delay || "0", 10);
  const force = command.options.force === "true";

  // Execute action
  try {
    switch (command.action) {
      case "shutdown":
        await shutdownSystem(delay, force);
        return createResponse(
          true,
          delay > 0
            ? `PC will shut down in ${delay} seconds`
            : "PC is shutting down..."
        );

      case "restart":
        await restartSystem(delay, force);
        return createResponse(
          true,
          delay > 0
            ? `PC will restart in ${delay} seconds`
            : "PC is restarting..."
        );

      case "sleep":
        await sleepSystem();
        return createResponse(true, "PC is going to sleep...");

      case "hibernate":
        await hibernateSystem();
        return createResponse(true, "PC is hibernating...");

      case "logout":
        await logoutSystem();
        return createResponse(true, "Logging out...");

      case "cancel":
        await cancelShutdown();
        return createResponse(true, "Shutdown cancelled");

      case "status":
        const status = getSystemInfo();
        return createResponse(true, "Status retrieved", status);

      case "ping":
        return createResponse(true, "pong", { hostname: os.hostname() });

      default:
        return createResponse(false, `Unknown action: ${command.action}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[BT] Action error: ${errorMessage}`);
    return createResponse(false, `Action failed: ${errorMessage}`);
  }
}

/**
 * Bluetooth Server class
 * Wraps the bluetooth-serial-port library
 */
export class BluetoothServer {
  private server: any = null;
  private btSerial: any = null;
  private secretKey: string;
  private isRunning: boolean = false;
  private btModule: any = null;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  /**
   * Initialize the Bluetooth module
   */
  private initModule(): boolean {
    if (this.btModule) return true;

    try {
      // Dynamic import to handle missing module gracefully
      this.btModule = require("bluetooth-serial-port");
      return true;
    } catch (error) {
      console.error("[BT] bluetooth-serial-port module not available");
      console.error("[BT] Install with: npm install bluetooth-serial-port");
      console.error("[BT] Note: Requires Visual Studio Build Tools on Windows");
      return false;
    }
  }

  /**
   * Start the Bluetooth RFCOMM server
   */
  async start(): Promise<boolean> {
    if (!this.initModule()) {
      return false;
    }

    return new Promise((resolve) => {
      try {
        const { BluetoothSerialPortServer } = this.btModule;
        this.server = new BluetoothSerialPortServer();

        this.server.listen(
          (clientAddress: string, channel: number) => {
            console.log(
              `[BT] Client connected: ${clientAddress} on channel ${channel}`
            );
          },
          (error: Error | null) => {
            if (error) {
              console.error("[BT] Server error:", error.message);
            }
          },
          {
            uuid: BT_CONFIG.uuid,
            channel: BT_CONFIG.channel,
          }
        );

        // Handle incoming data
        this.server.on("data", async (buffer: Buffer, address: string) => {
          const data = buffer.toString("utf-8");
          console.log(`[BT] Received from ${address}: ${data}`);

          const response = await processCommand(data, this.secretKey);
          this.server.write(Buffer.from(response), address);
        });

        this.isRunning = true;
        console.log("[BT] ═══════════════════════════════════════════");
        console.log("[BT] Bluetooth Server Started");
        console.log(`[BT] Service: ${BT_CONFIG.serviceName}`);
        console.log(`[BT] Hostname: ${os.hostname()}`);
        console.log("[BT] Waiting for connections...");
        console.log("[BT] ═══════════════════════════════════════════");
        resolve(true);
      } catch (error) {
        console.error("[BT] Failed to start Bluetooth server:", error);
        this.isRunning = false;
        resolve(false);
      }
    });
  }

  /**
   * List paired Bluetooth devices
   */
  listPairedDevices(): Promise<BluetoothDevice[]> {
    if (!this.initModule()) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      try {
        const { BluetoothSerialPort } = this.btModule;
        const btSerial = new BluetoothSerialPort();

        btSerial.listPairedDevices((devices: BluetoothDevice[]) => {
          console.log("[BT] Paired devices:");
          devices.forEach((device) => {
            console.log(`  - ${device.name || "Unknown"} (${device.address})`);
          });
          resolve(devices);
        });
      } catch (error) {
        console.error("[BT] Error listing devices:", error);
        resolve([]);
      }
    });
  }

  /**
   * Stop the Bluetooth server
   */
  stop(): void {
    if (this.server) {
      try {
        this.server.close();
        console.log("[BT] Bluetooth server stopped");
      } catch (error) {
        console.error("[BT] Error stopping server:", error);
      }
    }
    this.isRunning = false;
  }

  /**
   * Get server status
   */
  getStatus(): { running: boolean } {
    return {
      running: this.isRunning,
    };
  }
}

/**
 * Create and start a Bluetooth server
 */
export async function startBluetoothServer(
  secretKey: string
): Promise<BluetoothServer | null> {
  try {
    console.log("[BT] Initializing Bluetooth server...");

    const server = new BluetoothServer(secretKey);

    // List paired devices first
    await server.listPairedDevices();

    // Start the server
    const started = await server.start();

    if (started) {
      return server;
    }

    console.error("[BT] Failed to start Bluetooth server");
    return null;
  } catch (error) {
    console.error("[BT] Bluetooth initialization error:", error);
    console.log("[BT] Make sure:");
    console.log("  1. Bluetooth is enabled on this PC");
    console.log("  2. bluetooth-serial-port is installed correctly");
    console.log("  3. Visual Studio Build Tools are installed");
    return null;
  }
}

/**
 * Check if Bluetooth is available (module can be loaded)
 */
export function isBluetoothAvailable(): boolean {
  try {
    require("bluetooth-serial-port");
    return true;
  } catch {
    return false;
  }
}
