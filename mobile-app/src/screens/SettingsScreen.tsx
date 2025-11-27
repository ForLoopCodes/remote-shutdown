/**
 * Settings Screen
 *
 * Allows users to configure app settings and view help information.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedDevice } from "../types";

// Storage keys
const STORAGE_KEYS = {
  DEFAULT_DELAY: "@remote_shutdown_default_delay",
  CONFIRM_ACTIONS: "@remote_shutdown_confirm_actions",
  SECRET_KEY: "@remote_shutdown_secret",
  SAVED_DEVICES: "@remote_shutdown_saved_devices",
  PORT: "@remote_shutdown_port",
};

const SettingsScreen: React.FC = () => {
  const [defaultDelay, setDefaultDelay] = useState("0");
  const [confirmActions, setConfirmActions] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [port, setPort] = useState("3000");

  // Saved devices state
  const [savedDevices, setSavedDevices] = useState<SavedDevice[]>([]);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<SavedDevice | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [deviceIp, setDeviceIp] = useState("");
  const [devicePort, setDevicePort] = useState("3000");

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadSavedDevices();
  }, []);

  const loadSettings = async () => {
    try {
      const [delay, confirm, secret, savedPort] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_DELAY),
        AsyncStorage.getItem(STORAGE_KEYS.CONFIRM_ACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SECRET_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.PORT),
      ]);

      if (delay) setDefaultDelay(delay);
      if (confirm !== null) setConfirmActions(confirm === "true");
      if (secret) setSecretKey(secret);
      if (savedPort) setPort(savedPort);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  const handleDelayChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setDefaultDelay(numericValue);
    saveSetting(STORAGE_KEYS.DEFAULT_DELAY, numericValue);
  };

  const handleConfirmToggle = (value: boolean) => {
    setConfirmActions(value);
    saveSetting(STORAGE_KEYS.CONFIRM_ACTIONS, value.toString());
  };

  const handlePortChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPort(numericValue);
    saveSetting(STORAGE_KEYS.PORT, numericValue);
  };

  const handleSecretChange = (text: string) => {
    setSecretKey(text);
    saveSetting(STORAGE_KEYS.SECRET_KEY, text);
  };

  // Load saved devices
  const loadSavedDevices = async () => {
    try {
      const devices = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DEVICES);
      if (devices) {
        setSavedDevices(JSON.parse(devices));
      }
    } catch (error) {
      console.error("Error loading saved devices:", error);
    }
  };

  // Validate IP address
  const isValidIP = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  // Save device
  const handleSaveDevice = async () => {
    if (!deviceName.trim()) {
      Alert.alert("Error", "Please enter a device name");
      return;
    }
    if (!deviceIp || !isValidIP(deviceIp)) {
      Alert.alert("Error", "Please enter a valid IP address");
      return;
    }

    let newDevices: SavedDevice[];

    if (editingDevice) {
      // Update existing device
      newDevices = savedDevices.map((d) =>
        d.id === editingDevice.id
          ? {
              ...d,
              name: deviceName.trim(),
              ip: deviceIp,
              port: devicePort || "3000",
            }
          : d
      );
    } else {
      // Add new device
      const newDevice: SavedDevice = {
        id: Date.now().toString(),
        name: deviceName.trim(),
        ip: deviceIp,
        port: devicePort || "3000",
      };
      newDevices = [...savedDevices, newDevice];
    }

    setSavedDevices(newDevices);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DEVICES,
        JSON.stringify(newDevices)
      );
      Alert.alert(
        "Success",
        editingDevice ? "Device updated!" : "Device added!"
      );
    } catch (error) {
      console.error("Error saving device:", error);
      Alert.alert("Error", "Failed to save device");
    }

    closeModal();
  };

  // Delete device
  const handleDeleteDevice = async (device: SavedDevice) => {
    Alert.alert(
      "Delete Device",
      `Are you sure you want to delete "${device.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const newDevices = savedDevices.filter((d) => d.id !== device.id);
            setSavedDevices(newDevices);
            try {
              await AsyncStorage.setItem(
                STORAGE_KEYS.SAVED_DEVICES,
                JSON.stringify(newDevices)
              );
            } catch (error) {
              console.error("Error deleting device:", error);
            }
          },
        },
      ]
    );
  };

  // Open edit modal
  const openEditModal = (device: SavedDevice) => {
    setEditingDevice(device);
    setDeviceName(device.name);
    setDeviceIp(device.ip);
    setDevicePort(device.port);
    setShowAddDeviceModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingDevice(null);
    setDeviceName("");
    setDeviceIp("");
    setDevicePort("3000");
    setShowAddDeviceModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddDeviceModal(false);
    setEditingDevice(null);
    setDeviceName("");
    setDeviceIp("");
    setDevicePort("3000");
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all saved settings? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setDefaultDelay("0");
              setConfirmActions(true);
              setSecretKey("");
              setPort("3000");
              setSavedDevices([]);
              Alert.alert("Success", "All settings have been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear settings.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* All Settings in One Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Delay (seconds)</Text>
            <Text style={styles.settingDescription}>
              Time to wait before executing shutdown/restart
            </Text>
          </View>
          <TextInput
            style={styles.delayInput}
            value={defaultDelay}
            onChangeText={handleDelayChange}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Port</Text>
            <Text style={styles.settingDescription}>
              Port the desktop service is running on
            </Text>
          </View>
          <TextInput
            style={styles.delayInput}
            value={port}
            onChangeText={handlePortChange}
            keyboardType="numeric"
            placeholder="3000"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Confirm Before Action</Text>
            <Text style={styles.settingDescription}>
              Show confirmation dialog before sending commands
            </Text>
          </View>
          <Switch
            value={confirmActions}
            onValueChange={handleConfirmToggle}
            trackColor={{ false: "#E5E5EA", true: "#1C1C1E" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRowNoBorder}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Secret Key</Text>
            <Text style={styles.settingDescription}>
              Must match SHARED_SECRET_KEY in desktop service
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter shared secret key"
          placeholderTextColor="#999"
          value={secretKey}
          onChangeText={handleSecretChange}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Saved Devices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Devices</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {savedDevices.length === 0 ? (
          <Text style={styles.emptyText}>
            No saved devices. Add a device to quickly connect from the Home
            screen.
          </Text>
        ) : (
          savedDevices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceCardName}>{device.name}</Text>
                <Text style={styles.deviceCardIp}>
                  {device.ip}:{device.port}
                </Text>
              </View>
              <View style={styles.deviceActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(device)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDevice(device)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add/Edit Device Modal */}
      <Modal
        visible={showAddDeviceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingDevice ? "Edit Device" : "Add Device"}
            </Text>

            <Text style={styles.label}>Device Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., My PC, Office Desktop"
              placeholderTextColor="#999"
              value={deviceName}
              onChangeText={setDeviceName}
              autoFocus
            />

            <Text style={styles.label}>IP Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 192.168.43.100"
              placeholderTextColor="#999"
              value={deviceIp}
              onChangeText={setDeviceIp}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Port</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="3000"
              placeholderTextColor="#999"
              value={devicePort}
              onChangeText={setDevicePort}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveDevice}
              >
                <Text style={styles.modalSaveText}>
                  {editingDevice ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Text style={styles.dangerButtonText}>Clear All Saved Data</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Remote PC Shutdown v1.0.0</Text>
        <Text style={styles.aboutText}>
          Control your Windows PC from your phone
        </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  settingRowNoBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  settingDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  delayInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: "center",
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C3C43",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  helpCard: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#3C3C43",
    lineHeight: 22,
  },
  dangerButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 4,
  },
  // Saved Devices styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingVertical: 20,
  },
  deviceCard: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  deviceCardIp: {
    fontSize: 13,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  deviceActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#3A3A3C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingsScreen;
