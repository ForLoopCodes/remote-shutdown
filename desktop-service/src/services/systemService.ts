/**
 * System Service
 *
 * Handles system-level operations using the node-shutdown-windows package
 * and native Windows commands.
 *
 * NOTE: This service is designed for Windows only.
 * The node-shutdown-windows package uses Windows API for shutdown operations.
 */

import { exec } from "child_process";
import os from "os";
import { getLocalIPAddress } from "../utils/shutdown";

// Try to import node-shutdown-windows, fall back to exec if not available
let shutdownWindows: any = null;
try {
  shutdownWindows = require("node-shutdown-windows");
} catch (e) {
  console.log(
    "[SYSTEM] node-shutdown-windows not available, using fallback commands"
  );
}

/**
 * Shutdown the system
 * @param delay - Delay in seconds before shutdown (default: 0)
 * @param force - Force close applications without saving (default: false)
 */
export const shutdownSystem = (
  delay: number = 0,
  force: boolean = false
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(
      `[SYSTEM] Initiating shutdown (delay: ${delay}s, force: ${force})`
    );

    // Use node-shutdown-windows if available
    if (shutdownWindows && shutdownWindows.shutdown) {
      try {
        shutdownWindows.shutdown(delay, force);
        resolve();
        return;
      } catch (error) {
        console.log("[SYSTEM] node-shutdown-windows failed, using fallback");
      }
    }

    // Fallback to Windows shutdown command
    const forceFlag = force ? " /f" : "";
    const command = `shutdown /s /t ${delay}${forceFlag}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[SYSTEM] Shutdown command error:", error);
        reject(error);
      } else {
        console.log("[SYSTEM] Shutdown command executed successfully");
        resolve();
      }
    });
  });
};

/**
 * Restart the system
 * @param delay - Delay in seconds before restart (default: 0)
 * @param force - Force close applications without saving (default: false)
 */
export const restartSystem = (
  delay: number = 0,
  force: boolean = false
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(
      `[SYSTEM] Initiating restart (delay: ${delay}s, force: ${force})`
    );

    const forceFlag = force ? " /f" : "";
    const command = `shutdown /r /t ${delay}${forceFlag}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[SYSTEM] Restart command error:", error);
        reject(error);
      } else {
        console.log("[SYSTEM] Restart command executed successfully");
        resolve();
      }
    });
  });
};

/**
 * Put the system to sleep (actual sleep/standby mode)
 * Note: If hibernate is enabled in Windows, this might hibernate instead.
 * The SetSuspendState parameters: (Hibernate, Force, DisableWakeEvent)
 * - 0,1,0 = Sleep with force, wake events enabled
 */
export const sleepSystem = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log("[SYSTEM] Initiating sleep mode (standby)");

    // Windows sleep command using rundll32
    // SetSuspendState(Hibernate=0, Force=1, DisableWakeEvent=0)
    const command = "rundll32.exe powrprof.dll,SetSuspendState 0,1,0";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[SYSTEM] Sleep command error:", error);
        reject(error);
      } else {
        console.log("[SYSTEM] Sleep command executed successfully");
        resolve();
      }
    });
  });
};

/**
 * Put the system to hibernate
 * Hibernate saves RAM to disk and powers off completely.
 * SetSuspendState(1,1,0) = Hibernate with force
 */
export const hibernateSystem = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log("[SYSTEM] Initiating hibernate mode");

    // Windows hibernate command using rundll32
    // SetSuspendState(Hibernate=1, Force=1, DisableWakeEvent=0)
    const command = "rundll32.exe powrprof.dll,SetSuspendState 1,1,0";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[SYSTEM] Hibernate command error:", error);
        reject(error);
      } else {
        console.log("[SYSTEM] Hibernate command executed successfully");
        resolve();
      }
    });
  });
};

/**
 * Cancel any scheduled shutdown or restart
 */
export const cancelShutdown = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log("[SYSTEM] Cancelling scheduled shutdown/restart");

    exec("shutdown /a", (error, stdout, stderr) => {
      if (error) {
        // Error might occur if no shutdown was scheduled - that's okay
        console.log(
          "[SYSTEM] Cancel command returned error (might be no scheduled shutdown)"
        );
        resolve(); // Still resolve as it's not a critical error
      } else {
        console.log("[SYSTEM] Shutdown cancelled successfully");
        resolve();
      }
    });
  });
};

/**
 * Log out the current user
 */
export const logoutSystem = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log("[SYSTEM] Initiating logout");

    // Try using node-shutdown-windows logoff() first
    if (shutdownWindows && shutdownWindows.logoff) {
      try {
        shutdownWindows.logoff();
        console.log("[SYSTEM] Logout initiated via node-shutdown-windows");
        resolve();
        return;
      } catch (error) {
        console.log("[SYSTEM] node-shutdown-windows logoff failed, using fallback:", error);
      }
    }

    // Fallback to Windows command
    const command = "shutdown /l";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[SYSTEM] Logout command error:", error);
        reject(error);
      } else {
        console.log("[SYSTEM] Logout command executed successfully");
        resolve();
      }
    });
  });
};

/**
 * Get system information
 */
export const getSystemInfo = () => {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    uptime: Math.floor(os.uptime()),
    uptimeFormatted: formatUptime(os.uptime()),
    totalMemory: formatBytes(os.totalmem()),
    freeMemory: formatBytes(os.freemem()),
    cpus: os.cpus().length,
    localIP: getLocalIPAddress(),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format seconds to human readable uptime
 */
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "< 1m";
};

/**
 * Format bytes to human readable size
 */
const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};
