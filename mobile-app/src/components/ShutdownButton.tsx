/**
 * ShutdownButton Component
 *
 * A reusable button component for sending system commands.
 * Supports shutdown, restart, hibernate, and sleep actions.
 * Works with both WiFi (HTTP) and Bluetooth connections.
 *
 * Features:
 * - Countdown timer before executing action
 * - Press again to cancel during countdown
 * - Visual countdown display
 * - Pixel art icons
 */

import React, { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { sendSystemAction } from "../services/api";
import { sendBluetoothSystemAction } from "../services/bluetoothService";
import { SystemAction, ConnectionMode, BluetoothDevice } from "../types";
import { ShutdownIcon, RestartIcon, HibernateIcon, LogoutIcon } from "./Icons";

interface ShutdownButtonProps {
  action: SystemAction;
  ipAddress: string;
  secretKey: string;
  port: number;
  connectionMode?: ConnectionMode;
  bluetoothDevice?: BluetoothDevice | null;
  disabled?: boolean;
  delay?: number;
  force?: boolean;
  onValidate?: () => boolean;
  setLoading?: (loading: boolean) => void;
}

// Button configurations for each action type
const ACTION_CONFIG: Record<
  SystemAction,
  {
    label: string;
    confirmTitle: string;
    confirmMessage: string;
  }
> = {
  shutdown: {
    label: "Shutdown",
    confirmTitle: "Confirm Shutdown",
    confirmMessage:
      "Are you sure you want to shut down your PC? Any unsaved work may be lost.",
  },
  restart: {
    label: "Restart",
    confirmTitle: "Confirm Restart",
    confirmMessage:
      "Are you sure you want to restart your PC? Any unsaved work may be lost.",
  },
  hibernate: {
    label: "Hibernate",
    confirmTitle: "Confirm Hibernate",
    confirmMessage: "Put your PC into hibernate mode?",
  },
  sleep: {
    label: "Sleep",
    confirmTitle: "Confirm Sleep",
    confirmMessage: "Put your PC to sleep?",
  },
  logout: {
    label: "Logout",
    confirmTitle: "Confirm Logout",
    confirmMessage: "Log out from your PC?",
  },
  cancel: {
    label: "Cancel",
    confirmTitle: "Cancel Action",
    confirmMessage: "Cancel any scheduled shutdown or restart?",
  },
};

const ShutdownButton: React.FC<ShutdownButtonProps> = ({
  action,
  ipAddress,
  secretKey,
  port,
  connectionMode = "wifi",
  bluetoothDevice,
  disabled = false,
  delay = 0,
  force = false,
  onValidate,
  setLoading,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const config = ACTION_CONFIG[action];

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handlePress = () => {
    // If counting down, cancel the action
    if (isCountingDown) {
      cancelCountdown();
      return;
    }

    // Run validation if provided
    if (onValidate && !onValidate()) {
      return;
    }

    // Cancel action executes immediately (no countdown needed)
    if (action === "cancel") {
      executeAction();
      return;
    }

    // Start countdown for other actions
    startCountdown();
  };

  const startCountdown = () => {
    // If delay is 0, execute immediately
    if (delay === 0) {
      executeAction();
      return;
    }

    const countdownTime = delay;
    setIsCountingDown(true);
    setCountdown(countdownTime);

    // Countdown interval
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up, execute action
          if (countdownRef.current) clearInterval(countdownRef.current);
          executeAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsCountingDown(false);
    setCountdown(0);
    // No alert, just reset the button
  };

  const executeAction = async () => {
    // Clear any remaining timers
    if (countdownRef.current) clearInterval(countdownRef.current);

    setIsCountingDown(false);
    setCountdown(0);
    setIsProcessing(true);

    try {
      let response;

      if (connectionMode === "bluetooth") {
        // Send via Bluetooth
        response = await sendBluetoothSystemAction(action, secretKey, {
          delay: 0, // Delay already handled by countdown
          force,
        });
      } else {
        // Send via WiFi (HTTP)
        response = await sendSystemAction(action, ipAddress, secretKey, {
          delay: 0, // Delay already handled by countdown
          force,
          port,
        });
      }

      // Silent success - no alert
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine button text
  const getButtonText = () => {
    if (isCountingDown) {
      return `Cancel (${countdown})`;
    }
    return config.label;
  };

  // Get icon component for action
  const getIcon = () => {
    const iconColor = "#FFFFFF";
    const iconSize = 40;

    switch (action) {
      case "shutdown":
        return <ShutdownIcon size={iconSize} color={iconColor} />;
      case "restart":
        return <RestartIcon size={iconSize} color={iconColor} />;
      case "hibernate":
        return <HibernateIcon size={iconSize} color={iconColor} />;
      case "logout":
        return <LogoutIcon size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        isCountingDown && styles.buttonCountdown,
      ]}
      onPress={handlePress}
      disabled={disabled || isProcessing}
      activeOpacity={0.7}
    >
      {isProcessing ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {!isCountingDown && getIcon()}
          <Text
            style={[
              styles.buttonText,
              isCountingDown && styles.buttonTextCountdown,
              !isCountingDown && styles.buttonTextWithIcon,
            ]}
          >
            {getButtonText()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
  },
  buttonDisabled: {
    backgroundColor: "#3A3A3C",
    opacity: 0.6,
  },
  buttonCountdown: {
    backgroundColor: "#8E8E93",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextCountdown: {
    fontSize: 14,
  },
  buttonTextWithIcon: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default ShutdownButton;
