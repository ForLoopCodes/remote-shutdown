/**
 * Remote PC Shutdown Service
 *
 * This server listens for shutdown requests from the mobile app.
 * Supports both WiFi (HTTP) and Bluetooth (RFCOMM) connections.
 *
 * CONNECTIVITY OPTIONS:
 *
 * WiFi Mode (HTTP):
 * - The PC must be connected to the phone's hotspot (WiFi local network)
 * - The server listens on 0.0.0.0:3000 (all network interfaces)
 * - The mobile app sends HTTP POST requests to http://<pc-local-ip>:3000/api/shutdown
 * - Find your PC's local IP by running 'ipconfig' in Command Prompt
 *   Look for "IPv4 Address" under the WiFi adapter (usually 192.168.x.x)
 *
 * Bluetooth Mode (RFCOMM):
 * - Pair your phone with the PC via Windows Bluetooth settings
 * - The server advertises an SPP (Serial Port Profile) service
 * - The mobile app connects via Bluetooth Serial and sends commands
 */

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import shutdownRoutes from "./routes";
import { getLocalIPAddress } from "./utils/shutdown";
import {
  startBluetoothServer,
  isBluetoothAvailable,
  BluetoothServer,
} from "./services/bluetoothServer";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0"; // Bind to all network interfaces for local network access
const SECRET_KEY = process.env.SHARED_SECRET_KEY || "meetgoat1234";
const ENABLE_BLUETOOTH = process.env.ENABLE_BLUETOOTH !== "false"; // Default to true

// Store Bluetooth server reference for cleanup
let bluetoothServer: BluetoothServer | null = null;

// Enable CORS for mobile app requests
app.use(cors());

// Parse JSON request bodies
import os from "os";

app.use(express.json());

// Health check endpoint (no auth required)
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Remote Shutdown Service is running",
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    bluetooth: {
      available: isBluetoothAvailable(),
      enabled: ENABLE_BLUETOOTH,
      running: bluetoothServer?.getStatus().running ?? false,
    },
  });
});

// API routes (auth required)
app.use("/api", shutdownRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

/**
 * Start all servers (HTTP and optionally Bluetooth)
 */
async function startServers() {
  // Start HTTP server
  app.listen(PORT, HOST, async () => {
    const localIP = getLocalIPAddress();
    console.log("═".repeat(60));
    console.log("🖥️  Remote PC Shutdown Service Started");
    console.log("═".repeat(60));
    console.log("");
    console.log("📡 WiFi (HTTP) Server:");
    console.log(`   Listening on: http://${HOST}:${PORT}`);
    console.log(`   Local IP: ${localIP}`);
    console.log(`   Mobile app URL: http://${localIP}:${PORT}`);
    console.log("");

    // Start Bluetooth server if enabled
    if (ENABLE_BLUETOOTH) {
      console.log("🔵 Bluetooth Server:");
      if (isBluetoothAvailable()) {
        bluetoothServer = await startBluetoothServer(SECRET_KEY);
        if (bluetoothServer) {
          console.log("   Status: Running");
        } else {
          console.log("   Status: Failed to start");
          console.log(
            "   Note: Bluetooth server is optional, HTTP still works"
          );
        }
      } else {
        console.log("   Status: Not available");
        console.log("   bluetooth-serial-port module not installed");
        console.log("   Install with: npm install bluetooth-serial-port");
        console.log("   (Requires Visual Studio Build Tools on Windows)");
      }
    } else {
      console.log("🔵 Bluetooth Server: Disabled (ENABLE_BLUETOOTH=false)");
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("💡 SETUP INSTRUCTIONS:");
    console.log("");
    console.log("   WiFi Mode:");
    console.log("   1. Connect your PC to your phone's hotspot");
    console.log("   2. Enter the Local IP Address in the mobile app");
    console.log("   3. Use the same secret key in both app and service");
    console.log("");
    console.log("   Bluetooth Mode:");
    console.log("   1. Pair your phone with this PC via Bluetooth settings");
    console.log("   2. Select the PC in the app's Bluetooth device list");
    console.log("   3. Use the same secret key in both app and service");
    console.log("═".repeat(60));
  });
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[SERVER] Shutting down...");
  if (bluetoothServer) {
    bluetoothServer.stop();
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[SERVER] Terminating...");
  if (bluetoothServer) {
    bluetoothServer.stop();
  }
  process.exit(0);
});

// Start the servers
startServers();
