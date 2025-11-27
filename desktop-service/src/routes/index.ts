/**
 * API Routes for Remote Shutdown Service
 */

import { Router } from "express";
import {
  handleShutdown,
  handleRestart,
  handleCancel,
  handleStatus,
  handleSleep,
  handleHibernate,
  handleLogout,
} from "../controllers/shutdownController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication via shared secret key

// POST /api/shutdown - Shutdown the PC
router.post("/shutdown", authenticate, handleShutdown);

// POST /api/restart - Restart the PC
router.post("/restart", authenticate, handleRestart);

// POST /api/sleep - Put PC to sleep
router.post("/sleep", authenticate, handleSleep);

// POST /api/hibernate - Put PC to hibernate
router.post("/hibernate", authenticate, handleHibernate);

// POST /api/logout - Log out the current user
router.post("/logout", authenticate, handleLogout);

// POST /api/cancel - Cancel a scheduled shutdown/restart
router.post("/cancel", authenticate, handleCancel);

// GET /api/status - Get system status (also requires auth)
router.get("/status", authenticate, handleStatus);

export default router;
