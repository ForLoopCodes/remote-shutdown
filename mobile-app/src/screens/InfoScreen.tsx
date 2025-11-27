/**
 * Info Screen
 *
 * Displays system information and connection logs.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSystemStatus } from "../services/api";
import { SystemStatusResponse } from "../types";

// Storage keys
const STORAGE_KEYS = {
  IP_ADDRESS: "@remote_shutdown_ip",
  SECRET_KEY: "@remote_shutdown_secret",
  PORT: "@remote_shutdown_port",
  LOGS: "@remote_shutdown_logs",
};

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

// Global log storage
let globalLogs: LogEntry[] = [];

export const addLog = async (
  type: LogEntry["type"],
  message: string
): Promise<void> => {
  const entry: LogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
  };
  globalLogs = [entry, ...globalLogs].slice(0, 100); // Keep last 100 logs

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(globalLogs));
  } catch (error) {
    console.error("Error saving logs:", error);
  }
};

export const clearLogs = async (): Promise<void> => {
  globalLogs = [];
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOGS);
  } catch (error) {
    console.error("Error clearing logs:", error);
  }
};

const InfoScreen: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(
    null
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [port, setPort] = useState("3000");

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedIP, savedSecret, savedPort] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IP_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEYS.SECRET_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.PORT),
      ]);

      if (savedIP) setIpAddress(savedIP);
      if (savedSecret) setSecretKey(savedSecret);
      if (savedPort) setPort(savedPort);

      // Fetch status if we have connection info
      if (savedIP && savedSecret) {
        fetchSystemStatus(savedIP, savedSecret, parseInt(savedPort || "3000"));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadLogs = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        globalLogs = JSON.parse(savedLogs);
        setLogs(globalLogs);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const fetchSystemStatus = async (ip: string, key: string, p: number) => {
    setIsLoading(true);
    try {
      const status = await getSystemStatus(ip, key, p);
      setSystemStatus(status);
      await addLog("success", `System status fetched from ${ip}`);
      loadLogs();
    } catch (error) {
      await addLog(
        "error",
        `Failed to fetch system status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      loadLogs();
      setSystemStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSettings();
    await loadLogs();
    setRefreshing(false);
  }, []);

  const handleClearLogs = async () => {
    await clearLogs();
    setLogs([]);
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "#1C1C1E";
      case "error":
        return "#8E8E93";
      case "warning":
        return "#636366";
      default:
        return "#3A3A3C";
    }
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "[OK]";
      case "error":
        return "[ERR]";
      case "warning":
        return "[WARN]";
      default:
        return "[INFO]";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* System Status Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Information</Text>
          {isLoading && <ActivityIndicator size="small" color="#1C1C1E" />}
        </View>

        {systemStatus ? (
          <View style={styles.statusGrid}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Hostname</Text>
              <Text style={styles.statusValue}>{systemStatus.hostname}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Platform</Text>
              <Text style={styles.statusValue}>{systemStatus.platform}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Uptime</Text>
              <Text style={styles.statusValue}>
                {systemStatus.uptimeFormatted}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Total Memory</Text>
              <Text style={styles.statusValue}>{systemStatus.totalMemory}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Free Memory</Text>
              <Text style={styles.statusValue}>{systemStatus.freeMemory}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>CPU Cores</Text>
              <Text style={styles.statusValue}>{systemStatus.cpus}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Local IP</Text>
              <Text style={styles.statusValue}>{systemStatus.localIP}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Updated</Text>
              <Text style={styles.statusValue}>
                {new Date(systemStatus.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No system data available</Text>
            <Text style={styles.noDataHint}>
              Connect to your PC to view system information
            </Text>
          </View>
        )}
      </View>

      {/* Connection Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Details</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>IP Address</Text>
            <Text style={styles.statusValue}>{ipAddress || "Not set"}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Port</Text>
            <Text style={styles.statusValue}>{port}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Secret Key</Text>
            <Text style={styles.statusValue}>
              {secretKey ? "********" : "Not set"}
            </Text>
          </View>
        </View>
      </View>

      {/* Logs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Logs</Text>
          {logs.length > 0 && (
            <TouchableOpacity onPress={handleClearLogs}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {logs.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No logs yet</Text>
            <Text style={styles.noDataHint}>
              Activity will be logged here as you use the app
            </Text>
          </View>
        ) : (
          <View style={styles.logsContainer}>
            {logs.map((log) => (
              <View key={log.id} style={styles.logEntry}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text
                  style={[styles.logIcon, { color: getLogColor(log.type) }]}
                >
                  {getLogIcon(log.type)}
                </Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  clearButton: {
    fontSize: 14,
    color: "#1C1C1E",
    fontWeight: "600",
  },
  statusGrid: {
    gap: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  statusLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  noDataContainer: {
    padding: 24,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#3C3C43",
    marginBottom: 4,
  },
  noDataHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  logsContainer: {
    gap: 8,
  },
  logEntry: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  logTime: {
    fontSize: 12,
    color: "#8E8E93",
    width: 70,
    fontFamily: "monospace",
  },
  logIcon: {
    fontSize: 12,
    fontWeight: "700",
    width: 50,
    fontFamily: "monospace",
  },
  logMessage: {
    flex: 1,
    fontSize: 13,
    color: "#3C3C43",
  },
});

export default InfoScreen;
