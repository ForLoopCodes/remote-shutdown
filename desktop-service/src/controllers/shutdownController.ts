/**
 * Shutdown Controller
 *
 * Handles all system power management operations:
 * - Shutdown
 * - Restart
 * - Sleep
 * - Cancel scheduled operations
 */

import { Request, Response } from "express";
import {
  shutdownSystem,
  restartSystem,
  sleepSystem,
  hibernateSystem,
  cancelShutdown,
  logoutSystem,
  getSystemInfo,
} from "../services/systemService";
import { ShutdownRequestBody } from "../types";

/**
 * Handle shutdown request
 * POST /api/shutdown
 */
export const handleShutdown = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { delay = 0, force = false }: ShutdownRequestBody = req.body;

  console.log(
    `[SHUTDOWN] 🔴 Shutdown requested with delay: ${delay}s, force: ${force}`
  );

  try {
    await shutdownSystem(delay, force);

    const scheduledTime = new Date(Date.now() + delay * 1000).toISOString();

    res.status(200).json({
      success: true,
      message:
        delay > 0
          ? `Shutdown scheduled in ${delay} seconds`
          : "Shutdown initiated immediately",
      scheduledTime,
    });
  } catch (error) {
    console.error("[SHUTDOWN] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate shutdown",
      code: "SHUTDOWN_FAILED",
    });
  }
};

/**
 * Handle restart request
 * POST /api/restart
 */
export const handleRestart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { delay = 0, force = false }: ShutdownRequestBody = req.body;

  console.log(
    `[RESTART] 🔄 Restart requested with delay: ${delay}s, force: ${force}`
  );

  try {
    await restartSystem(delay, force);

    const scheduledTime = new Date(Date.now() + delay * 1000).toISOString();

    res.status(200).json({
      success: true,
      message:
        delay > 0
          ? `Restart scheduled in ${delay} seconds`
          : "Restart initiated immediately",
      scheduledTime,
    });
  } catch (error) {
    console.error("[RESTART] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate restart",
      code: "RESTART_FAILED",
    });
  }
};

/**
 * Handle sleep request
 * POST /api/sleep
 */
export const handleSleep = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(`[SLEEP] 😴 Sleep requested`);

  try {
    await sleepSystem();

    res.status(200).json({
      success: true,
      message: "Sleep mode initiated",
    });
  } catch (error) {
    console.error("[SLEEP] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate sleep mode",
      code: "SLEEP_FAILED",
    });
  }
};

/**
 * Handle hibernate request
 * POST /api/hibernate
 */
export const handleHibernate = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(`[HIBERNATE] 💤 Hibernate requested`);

  try {
    await hibernateSystem();

    res.status(200).json({
      success: true,
      message: "Hibernate mode initiated",
    });
  } catch (error) {
    console.error("[HIBERNATE] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate hibernate mode",
      code: "HIBERNATE_FAILED",
    });
  }
};

/**
 * Handle cancel shutdown/restart request
 * POST /api/cancel
 */
export const handleCancel = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[CANCEL] 🚫 Cancel shutdown/restart requested");

  try {
    await cancelShutdown();

    res.status(200).json({
      success: true,
      message: "Scheduled shutdown/restart cancelled",
    });
  } catch (error) {
    console.error("[CANCEL] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel or no scheduled shutdown found",
      code: "CANCEL_FAILED",
    });
  }
};

/**
 * Handle logout request
 * POST /api/logout
 */
export const handleLogout = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[LOGOUT] 🚪 Logout requested");

  try {
    await logoutSystem();

    res.status(200).json({
      success: true,
      message: "Logging out...",
    });
  } catch (error) {
    console.error("[LOGOUT] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout",
      code: "LOGOUT_FAILED",
    });
  }
};

/**
 * Get system status
 * GET /api/status
 */
export const handleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[STATUS] 📊 Status requested");

  try {
    const info = getSystemInfo();

    res.status(200).json({
      success: true,
      ...info,
    });
  } catch (error) {
    console.error("[STATUS] ❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get system status",
      code: "STATUS_FAILED",
    });
  }
};
