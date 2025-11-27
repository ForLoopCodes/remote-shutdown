/**
 * Authentication Middleware
 *
 * Simple shared secret key authentication to prevent unauthorized shutdowns.
 * The secret key can be passed either in:
 * - Request body: { "key": "your-secret" }
 * - Header: X-Shared-Secret: your-secret
 */

import { Request, Response, NextFunction } from "express";

// Default secret key - CHANGE THIS in production or use .env file
const SECRET_KEY =
  process.env.SHARED_SECRET_KEY || "meetgoat1234";

// Log the expected key on startup (first few chars only for debugging)
console.log(
  `[AUTH] Expected key starts with: "${SECRET_KEY.substring(
    0,
    3
  )}..." (length: ${SECRET_KEY.length})`
);

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check for key in request body or header
  const keyFromBody = req.body?.key;
  const keyFromHeader = req.headers["x-shared-secret"];

  const providedKey = keyFromBody || keyFromHeader;

  if (!providedKey) {
    console.log(
      `[AUTH] ❌ Request rejected - No secret key provided from ${req.ip}`
    );
    res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a secret key.",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  // Trim the key to remove any whitespace/newlines that might be added
  const trimmedProvidedKey = String(providedKey).trim();
  const trimmedSecretKey = SECRET_KEY.trim();

  if (trimmedProvidedKey === trimmedSecretKey) {
    console.log(`[AUTH] ✅ Request authenticated from ${req.ip}`);
    next();
  } else {
    // Debug: show key lengths and first chars to help identify mismatch
    console.log(
      `[AUTH] ❌ Request rejected - Invalid secret key from ${req.ip}`
    );
    console.log(
      `[AUTH]    Received: "${trimmedProvidedKey.substring(
        0,
        3
      )}..." (length: ${trimmedProvidedKey.length})`
    );
    console.log(
      `[AUTH]    Expected: "${trimmedSecretKey.substring(0, 3)}..." (length: ${
        trimmedSecretKey.length
      })`
    );
    res.status(403).json({
      success: false,
      error: "Invalid secret key. Access denied.",
      code: "INVALID_KEY",
    });
  }
};

// Export the secret key for testing purposes (in production, don't expose this)
export const getSecretKey = (): string => SECRET_KEY;
