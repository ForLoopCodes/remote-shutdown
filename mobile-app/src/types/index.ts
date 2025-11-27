/**
 * Type definitions for the Remote Shutdown Mobile App
 */

// Connection mode (WiFi HTTP or Bluetooth)
export type ConnectionMode = "wifi" | "bluetooth";

// Bluetooth device information
export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  bonded?: boolean;
  connected?: boolean;
}

// Device configuration stored locally
export interface DeviceConfig {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  secretKey: string;
  lastConnected?: string;
  // Bluetooth specific
  bluetoothAddress?: string;
  connectionMode?: ConnectionMode;
}

// Saved device for quick access
export interface SavedDevice {
  id: string;
  name: string;
  ip: string;
  port: string;
}

// API Request types
export interface ShutdownRequest {
  key: string;
  delay?: number;
  force?: boolean;
}

// API Response types
export interface ApiResponse {
  success: boolean;
  message: string;
  scheduledTime?: string;
}

export interface SystemStatusResponse {
  success: boolean;
  hostname: string;
  platform: string;
  uptime: number;
  uptimeFormatted: string;
  totalMemory: string;
  freeMemory: string;
  cpus: number;
  localIP: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AddDevice: { device?: DeviceConfig };
};

// Action types
export type SystemAction =
  | "shutdown"
  | "restart"
  | "sleep"
  | "hibernate"
  | "logout"
  | "cancel";

// App settings
export interface AppSettings {
  defaultDelay: number;
  confirmBeforeAction: boolean;
  theme: "light" | "dark" | "system";
  preferredConnectionMode: ConnectionMode;
  autoFallback: boolean; // Auto-try other method if one fails
}
