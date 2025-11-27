/**
 * API Service for Remote Shutdown
 *
 * Handles all HTTP communication with the desktop service.
 *
 * CONNECTIVITY NOTE:
 * - The mobile app sends HTTP requests to the PC's local IP address
 * - Both devices must be on the same network (phone hotspot)
 * - The PC service must be running and listening on port 3000
 * - The URL format is: http://<pc-local-ip>:3000/api/<endpoint>
 */

import axios, { AxiosError } from "axios";
import {
  ApiResponse,
  SystemStatusResponse,
  ErrorResponse,
  SystemAction,
} from "../types";

// Default timeout for requests (10 seconds - increased for slow networks)
const DEFAULT_TIMEOUT = 10000;

/**
 * Create axios instance with base configuration
 */
const createApiClient = (ipAddress: string, port: number = 3000) => {
  return axios.create({
    baseURL: `http://${ipAddress}:${port}/api`,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Send a shutdown request to the PC
 * @param ipAddress - PC's local IP address (e.g., 192.168.x.x)
 * @param secretKey - Shared secret key for authentication
 * @param delay - Optional delay in seconds before shutdown
 * @param force - Optional force close applications
 */
export const sendShutdownRequest = async (
  ipAddress: string,
  secretKey: string,
  delay: number = 0,
  force: boolean = false,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/shutdown", {
      key: secretKey,
      delay,
      force,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Send a restart request to the PC
 */
export const sendRestartRequest = async (
  ipAddress: string,
  secretKey: string,
  delay: number = 0,
  force: boolean = false,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/restart", {
      key: secretKey,
      delay,
      force,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Send a sleep request to the PC
 */
export const sendSleepRequest = async (
  ipAddress: string,
  secretKey: string,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/sleep", {
      key: secretKey,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Send a hibernate request to the PC
 */
export const sendHibernateRequest = async (
  ipAddress: string,
  secretKey: string,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/hibernate", {
      key: secretKey,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Cancel a scheduled shutdown/restart
 */
export const sendCancelRequest = async (
  ipAddress: string,
  secretKey: string,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/cancel", {
      key: secretKey,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Send a logout request to the PC
 */
export const sendLogoutRequest = async (
  ipAddress: string,
  secretKey: string,
  port: number = 3000
): Promise<ApiResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.post<ApiResponse>("/logout", {
      key: secretKey,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get system status from the PC
 */
export const getSystemStatus = async (
  ipAddress: string,
  secretKey: string,
  port: number = 3000
): Promise<SystemStatusResponse> => {
  try {
    const client = createApiClient(ipAddress, port);
    const response = await client.get<SystemStatusResponse>("/status", {
      headers: {
        "X-Shared-Secret": secretKey,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check if the service is reachable (health check)
 * Returns hostname if connected, null otherwise
 */
export const checkConnection = async (
  ipAddress: string,
  port: number = 3000
): Promise<{ connected: boolean; hostname?: string }> => {
  try {
    const response = await axios.get(`http://${ipAddress}:${port}/health`, {
      timeout: 3000,
    });
    if (response.data?.status === "ok") {
      return { connected: true, hostname: response.data.hostname };
    }
    return { connected: false };
  } catch (error) {
    return { connected: false };
  }
};

/**
 * Unified function to send system action
 */
export const sendSystemAction = async (
  action: SystemAction,
  ipAddress: string,
  secretKey: string,
  options: { delay?: number; force?: boolean; port?: number } = {}
): Promise<ApiResponse> => {
  const { delay = 0, force = false, port = 3000 } = options;

  switch (action) {
    case "shutdown":
      return sendShutdownRequest(ipAddress, secretKey, delay, force, port);
    case "restart":
      return sendRestartRequest(ipAddress, secretKey, delay, force, port);
    case "sleep":
      return sendSleepRequest(ipAddress, secretKey, port);
    case "hibernate":
      return sendHibernateRequest(ipAddress, secretKey, port);
    case "logout":
      return sendLogoutRequest(ipAddress, secretKey, port);
    case "cancel":
      return sendCancelRequest(ipAddress, secretKey, port);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

/**
 * Handle API errors and return user-friendly messages
 */
const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    // Network error (no response)
    if (!axiosError.response) {
      if (axiosError.code === "ECONNREFUSED") {
        return new Error(
          "Cannot connect to PC. Make sure the service is running and you're on the same network."
        );
      }
      if (
        axiosError.code === "ETIMEDOUT" ||
        axiosError.code === "ECONNABORTED"
      ) {
        return new Error(
          "Connection timed out. Check if the IP address is correct and the PC is reachable."
        );
      }
      return new Error(
        "Network error. Please check your connection and try again."
      );
    }

    // Server responded with error
    const { status, data } = axiosError.response;

    switch (status) {
      case 401:
        return new Error(
          "Authentication required. Please check your secret key."
        );
      case 403:
        return new Error("Invalid secret key. Access denied.");
      case 404:
        return new Error(
          "Endpoint not found. Make sure the service is running the correct version."
        );
      case 500:
        return new Error(data?.error || "Server error occurred.");
      default:
        return new Error(data?.error || `Request failed with status ${status}`);
    }
  }

  return error instanceof Error
    ? error
    : new Error("An unexpected error occurred");
};
