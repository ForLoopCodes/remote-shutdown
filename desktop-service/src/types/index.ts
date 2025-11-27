/**
 * Type definitions for the Remote Shutdown Service
 */

// Request body for shutdown endpoint
export interface ShutdownRequestBody {
  key: string; // Shared secret key for authentication
  delay?: number; // Optional delay in seconds before shutdown (default: 0)
  force?: boolean; // Optional force close applications (default: false)
  restart?: boolean; // Optional restart instead of shutdown (default: false)
}

// Response from shutdown endpoint
export interface ShutdownResponse {
  success: boolean;
  message: string;
  scheduledTime?: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// System info response
export interface SystemInfoResponse {
  hostname: string;
  platform: string;
  uptime: number;
  localIP: string;
}

// Action types for system operations
export type SystemAction = "shutdown" | "restart" | "sleep" | "cancel";
