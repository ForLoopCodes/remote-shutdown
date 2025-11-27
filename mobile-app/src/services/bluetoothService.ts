/**
 * Bluetooth Service for Remote Shutdown
 *
 * Handles Bluetooth Classic (RFCOMM/SPP) communication with the desktop service.
 * Uses react-native-bluetooth-classic for serial communication.
 *
 * CONNECTIVITY NOTE:
 * - Requires Bluetooth to be enabled on both devices
 * - Devices must be paired beforehand via OS Bluetooth settings
 * - Commands are sent as plain text: "action:key" format
 * - Example: "shutdown:mysecretkey123"
 *
 * IMPORTANT: This requires a development build (not Expo Go)
 * Run: npx expo prebuild && npx expo run:android
 */

import { Platform, PermissionsAndroid } from "react-native";
import { ApiResponse, SystemAction } from "../types";

// Type definitions for react-native-bluetooth-classic
// The actual import will be done dynamically to avoid crashes in Expo Go
interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  bonded?: boolean;
  connected?: boolean;
}

interface BluetoothNativeDevice {
  read(): Promise<string>;
  write(data: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  onDataReceived(callback: (data: { data: string }) => void): {
    remove: () => void;
  };
}

// Lazy load the Bluetooth module to prevent Expo Go crashes
let RNBluetoothClassic: any = null;
let bluetoothInitialized = false;

/**
 * Initialize Bluetooth module (call this before using BT features)
 */
export const initializeBluetooth = async (): Promise<boolean> => {
  if (bluetoothInitialized && RNBluetoothClassic) {
    return true;
  }

  try {
    // Dynamically import to prevent Expo Go crashes
    const module = require("react-native-bluetooth-classic");
    RNBluetoothClassic = module.default || module;

    // Verify the module loaded correctly
    if (
      !RNBluetoothClassic ||
      typeof RNBluetoothClassic.getBondedDevices !== "function"
    ) {
      console.warn(
        "Bluetooth module loaded but getBondedDevices not available"
      );
      RNBluetoothClassic = null;
      return false;
    }

    bluetoothInitialized = true;
    return true;
  } catch (error) {
    console.warn(
      "Bluetooth Classic not available. Use a development build for Bluetooth support.",
      error
    );
    RNBluetoothClassic = null;
    bluetoothInitialized = false;
    return false;
  }
};

/**
 * Check if Bluetooth module is available
 */
export const isBluetoothAvailable = (): boolean => {
  return RNBluetoothClassic !== null;
};

/**
 * Request Bluetooth permissions (Android only)
 */
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true; // iOS handles permissions differently
  }

  try {
    // Android 12+ requires BLUETOOTH_CONNECT and BLUETOOTH_SCAN
    if (Platform.Version >= 31) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);

      return Object.values(results).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // Android < 12
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Bluetooth Permission",
          message: "This app needs Bluetooth access to connect to your PC.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (error) {
    console.error("Error requesting Bluetooth permissions:", error);
    return false;
  }
};

/**
 * Check if Bluetooth is enabled on the device
 */
export const isBluetoothEnabled = async (): Promise<boolean> => {
  if (!RNBluetoothClassic) {
    console.warn("Bluetooth not initialized");
    return false;
  }

  try {
    return await RNBluetoothClassic.isBluetoothEnabled();
  } catch (error) {
    console.error("Error checking Bluetooth status:", error);
    return false;
  }
};

/**
 * Request to enable Bluetooth (Android only)
 */
export const requestBluetoothEnable = async (): Promise<boolean> => {
  if (!RNBluetoothClassic) {
    return false;
  }

  try {
    return await RNBluetoothClassic.requestBluetoothEnabled();
  } catch (error) {
    console.error("Error enabling Bluetooth:", error);
    return false;
  }
};

/**
 * Get list of paired/bonded Bluetooth devices
 */
export const getPairedDevices = async (): Promise<BluetoothDevice[]> => {
  if (!RNBluetoothClassic) {
    console.warn("Bluetooth module not available - requires development build");
    return [];
  }

  try {
    const devices = await RNBluetoothClassic.getBondedDevices();
    if (!devices) {
      return [];
    }
    return devices.map((device: any) => ({
      id: device.id || device.address,
      name: device.name || "Unknown Device",
      address: device.address,
      bonded: true,
    }));
  } catch (error) {
    console.error("Error getting paired devices:", error);
    // Return empty array instead of throwing - Bluetooth may not be supported
    return [];
  }
};

// Store the current connection
let currentConnection: BluetoothNativeDevice | null = null;
let currentDeviceAddress: string | null = null;

/**
 * Connect to a Bluetooth device
 */
export const connectToDevice = async (
  deviceAddress: string
): Promise<boolean> => {
  if (!RNBluetoothClassic) {
    throw new Error("Bluetooth not available. Use a development build.");
  }

  try {
    // Disconnect existing connection if any
    if (currentConnection) {
      await disconnectDevice();
    }

    console.log(`[BT] Connecting to device: ${deviceAddress}`);

    // Connect to the device
    currentConnection = await RNBluetoothClassic.connectToDevice(
      deviceAddress,
      {
        delimiter: "\n",
        charset: "utf-8",
      }
    );

    currentDeviceAddress = deviceAddress;
    console.log("[BT] Connected successfully");
    return true;
  } catch (error) {
    console.error("[BT] Connection error:", error);
    currentConnection = null;
    currentDeviceAddress = null;
    throw new Error(
      `Failed to connect: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Disconnect from current device
 */
export const disconnectDevice = async (): Promise<void> => {
  if (currentConnection) {
    try {
      await currentConnection.disconnect();
    } catch (error) {
      console.error("[BT] Disconnect error:", error);
    }
    currentConnection = null;
    currentDeviceAddress = null;
  }
};

/**
 * Check if currently connected to a device
 */
export const isDeviceConnected = async (): Promise<boolean> => {
  if (!currentConnection) {
    return false;
  }

  try {
    return await currentConnection.isConnected();
  } catch (error) {
    return false;
  }
};

/**
 * Get current connected device address
 */
export const getConnectedDeviceAddress = (): string | null => {
  return currentDeviceAddress;
};

/**
 * Send a command via Bluetooth and wait for response
 * Command format: "action:key:options"
 * Example: "shutdown:mysecret:delay=30,force=true"
 */
export const sendBluetoothCommand = async (
  action: SystemAction,
  secretKey: string,
  options: { delay?: number; force?: boolean } = {}
): Promise<ApiResponse> => {
  if (!currentConnection) {
    throw new Error("Not connected to any device. Please connect first.");
  }

  const isConnected = await isDeviceConnected();
  if (!isConnected) {
    currentConnection = null;
    currentDeviceAddress = null;
    throw new Error("Device disconnected. Please reconnect.");
  }

  try {
    // Build command string
    const optionsStr = Object.entries(options)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(",");

    const command = optionsStr
      ? `${action}:${secretKey}:${optionsStr}\n`
      : `${action}:${secretKey}\n`;

    console.log(`[BT] Sending command: ${action}`);

    // Send the command
    await currentConnection.write(command);

    // Wait for response (with timeout)
    const response = await waitForResponse(5000);

    // Parse response
    return parseBluetoothResponse(response);
  } catch (error) {
    console.error("[BT] Command error:", error);
    throw new Error(
      `Bluetooth command failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Wait for a response from the device
 */
const waitForResponse = async (timeout: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Response timeout"));
    }, timeout);

    if (!currentConnection) {
      clearTimeout(timeoutId);
      reject(new Error("No connection"));
      return;
    }

    // Read response
    currentConnection
      .read()
      .then((data: string) => {
        clearTimeout(timeoutId);
        resolve(data.trim());
      })
      .catch((error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Parse Bluetooth response string into ApiResponse
 * Expected format: "OK:message" or "ERROR:message"
 */
const parseBluetoothResponse = (response: string): ApiResponse => {
  const parts = response.split(":");
  const status = parts[0]?.toUpperCase();
  const message = parts.slice(1).join(":") || response;

  if (status === "OK" || status === "SUCCESS") {
    return {
      success: true,
      message: message || "Command executed successfully",
    };
  } else if (status === "ERROR" || status === "FAIL") {
    throw new Error(message || "Command failed");
  } else {
    // Try to parse as JSON
    try {
      const json = JSON.parse(response);
      return {
        success: json.success ?? true,
        message: json.message || "Command executed",
      };
    } catch {
      // Assume success if we got any response
      return {
        success: true,
        message: response || "Command sent",
      };
    }
  }
};

/**
 * Send system action via Bluetooth (unified interface matching HTTP API)
 */
export const sendBluetoothSystemAction = async (
  action: SystemAction,
  secretKey: string,
  options: { delay?: number; force?: boolean } = {}
): Promise<ApiResponse> => {
  return sendBluetoothCommand(action, secretKey, options);
};
