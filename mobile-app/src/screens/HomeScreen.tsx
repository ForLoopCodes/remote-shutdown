/**
 * Home Screen
 *
 * Main screen for sending shutdown/restart/sleep commands to the PC.
 * Supports both WiFi (HTTP) and Bluetooth connections.
 *
 * USAGE:
 * WiFi Mode:
 * 1. Enter your PC's local IP address (found via ipconfig on Windows)
 * 2. Enter the shared secret key (same as configured in the service)
 * 3. Tap the desired action button
 *
 * Bluetooth Mode:
 * 1. Pair your phone with the PC via Bluetooth settings
 * 2. Select the paired device from the list
 * 3. Enter the secret key
 * 4. Tap the desired action button
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ShutdownButton from "../components/ShutdownButton";
import { AppLogo } from "../components/Icons";
import { checkConnection } from "../services/api";
import {
  quickScan,
  scanNetwork,
  scanHotspotDevices,
  DiscoveredDevice,
} from "../services/networkScanner";
import {
  initializeBluetooth,
  getPairedDevices,
  connectToDevice,
  disconnectDevice,
  isDeviceConnected,
} from "../services/bluetoothService";
import { addLog } from "./InfoScreen";
import { ConnectionMode, BluetoothDevice, SavedDevice } from "../types";

// Storage keys
const STORAGE_KEYS = {
  IP_ADDRESS: "@remote_shutdown_ip",
  SECRET_KEY: "@remote_shutdown_secret",
  PORT: "@remote_shutdown_port",
  CONNECTION_MODE: "@remote_shutdown_mode",
  BT_DEVICE_ADDRESS: "@remote_shutdown_bt_address",
  BT_DEVICE_NAME: "@remote_shutdown_bt_name",
  SAVED_DEVICES: "@remote_shutdown_saved_devices",
  DEFAULT_DELAY: "@remote_shutdown_default_delay",
};

const HomeScreen: React.FC = () => {
  // Connection mode
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("wifi");

  // WiFi form state
  const [ipAddress, setIpAddress] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [port, setPort] = useState("3000");
  const [defaultDelay, setDefaultDelay] = useState(0);

  // Auto-discovery state
  const [isNetworkScanning, setIsNetworkScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);
  const [showDeviceList, setShowDeviceList] = useState(false);

  // Bluetooth state
  const [btInitialized, setBtInitialized] = useState(false);
  const [btDevices, setBtDevices] = useState<BluetoothDevice[]>([]);
  const [selectedBtDevice, setSelectedBtDevice] =
    useState<BluetoothDevice | null>(null);
  const [btConnected, setBtConnected] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectedHostname, setConnectedHostname] = useState<string | null>(
    null
  );

  // Saved Devices
  const [savedDevices, setSavedDevices] = useState<SavedDevice[]>([]);
  const [showSaveDeviceModal, setShowSaveDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");

  // Loading state for actions
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load saved settings whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedSettings();
      loadSavedDevices();
    }, [])
  );

  // Initialize Bluetooth when mode changes
  useEffect(() => {
    if (connectionMode === "bluetooth" && !btInitialized) {
      initBluetooth();
    }
  }, [connectionMode, btInitialized]);

  // Check connection when IP changes (WiFi mode)
  useEffect(() => {
    if (connectionMode === "wifi" && ipAddress && isValidIP(ipAddress)) {
      const timer = setTimeout(() => {
        checkPCConnection();
      }, 500);
      return () => clearTimeout(timer);
    } else if (connectionMode === "wifi") {
      setIsConnected(false);
    }
  }, [ipAddress, port, connectionMode]);

  // Update connected status based on mode
  useEffect(() => {
    if (connectionMode === "bluetooth") {
      setIsConnected(btConnected);
    }
  }, [connectionMode, btConnected]);

  // Initialize Bluetooth
  const initBluetooth = async () => {
    try {
      const result = await initializeBluetooth();
      setBtInitialized(result);
      if (result) {
        loadPairedDevices();
      } else {
        // Only show alert if user explicitly tried to use Bluetooth
        Alert.alert(
          "Bluetooth Not Available",
          "Bluetooth requires a development build and won't work in Expo Go.\n\nTo use Bluetooth:\n1. Run: npx expo prebuild\n2. Run: npx expo run:android\n\nOr use WiFi mode instead."
        );
      }
    } catch (error) {
      console.error("Bluetooth init error:", error);
      setBtInitialized(false);
    }
  };

  // Load paired Bluetooth devices
  const loadPairedDevices = async () => {
    if (!btInitialized) {
      return;
    }
    setIsScanning(true);
    try {
      const devices = await getPairedDevices();
      setBtDevices(devices);
    } catch (error) {
      console.error("Error loading paired devices:", error);
      // Don't show alert - just log the error
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to Bluetooth device
  const handleBtConnect = async (device: BluetoothDevice) => {
    setShowDevicePicker(false);
    setIsChecking(true);
    try {
      const connected = await connectToDevice(device.address);
      if (connected) {
        setSelectedBtDevice(device);
        setBtConnected(true);
        setIsConnected(true);
        // Save selected device
        await AsyncStorage.setItem(
          STORAGE_KEYS.BT_DEVICE_ADDRESS,
          device.address
        );
        await AsyncStorage.setItem(STORAGE_KEYS.BT_DEVICE_NAME, device.name);
      } else {
        Alert.alert(
          "Connection Failed",
          "Could not connect to the device. Make sure the PC Bluetooth server is running."
        );
      }
    } catch (error) {
      console.error("BT connect error:", error);
      Alert.alert("Error", "Failed to connect to device");
    } finally {
      setIsChecking(false);
    }
  };

  // Disconnect Bluetooth
  const handleBtDisconnect = async () => {
    try {
      await disconnectDevice();
      setBtConnected(false);
      setIsConnected(false);
    } catch (error) {
      console.error("BT disconnect error:", error);
    }
  };

  // Load settings from AsyncStorage
  const loadSavedSettings = async () => {
    try {
      const [
        savedIP,
        savedSecret,
        savedPort,
        savedMode,
        savedBtAddress,
        savedBtName,
        savedDelay,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IP_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEYS.SECRET_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.PORT),
        AsyncStorage.getItem(STORAGE_KEYS.CONNECTION_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.BT_DEVICE_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEYS.BT_DEVICE_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_DELAY),
      ]);

      if (savedIP) setIpAddress(savedIP);
      if (savedSecret) setSecretKey(savedSecret);
      if (savedPort) setPort(savedPort);
      if (savedMode) setConnectionMode(savedMode as ConnectionMode);
      if (savedDelay) setDefaultDelay(parseInt(savedDelay, 10) || 0);
      if (savedBtAddress && savedBtName) {
        setSelectedBtDevice({
          id: savedBtAddress,
          name: savedBtName,
          address: savedBtAddress,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Load saved devices from AsyncStorage
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

  // Save device to list
  const saveDevice = async (name: string, ip: string, devicePort: string) => {
    if (!ip || !isValidIP(ip) || !name.trim()) return;

    const newDevice: SavedDevice = {
      id: Date.now().toString(),
      name: name.trim(),
      ip,
      port: devicePort || "3000",
    };

    // Check if IP already exists, update it
    const existingIndex = savedDevices.findIndex((d) => d.ip === ip);
    let newDevices: SavedDevice[];

    if (existingIndex >= 0) {
      newDevices = [...savedDevices];
      newDevices[existingIndex] = {
        ...newDevices[existingIndex],
        name: name.trim(),
      };
    } else {
      newDevices = [newDevice, ...savedDevices];
    }

    setSavedDevices(newDevices);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DEVICES,
        JSON.stringify(newDevices)
      );
    } catch (error) {
      console.error("Error saving device:", error);
    }
  };

  // Remove device from list
  const removeDevice = async (id: string) => {
    const newDevices = savedDevices.filter((d) => d.id !== id);
    setSavedDevices(newDevices);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DEVICES,
        JSON.stringify(newDevices)
      );
    } catch (error) {
      console.error("Error removing device:", error);
    }
  };

  // Handle save device from modal
  const handleSaveDevice = () => {
    if (!newDeviceName.trim()) {
      Alert.alert("Error", "Please enter a device name");
      return;
    }
    saveDevice(newDeviceName, ipAddress, port);
    setShowSaveDeviceModal(false);
    setNewDeviceName("");
    Alert.alert("Success", `Device "${newDeviceName}" saved!`);
  };

  // Handle connection mode change
  const handleModeChange = async (mode: ConnectionMode) => {
    setConnectionMode(mode);
    setIsConnected(false);
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTION_MODE, mode);
    await addLog(
      "info",
      `Switched to ${mode === "wifi" ? "WiFi" : "Bluetooth"} mode`
    );
  };

  // Validate IP address format
  const isValidIP = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  // Check if PC is reachable
  const checkPCConnection = async () => {
    if (!ipAddress || !isValidIP(ipAddress)) return;

    setIsChecking(true);
    try {
      const portNum = parseInt(port, 10) || 3000;
      const result = await checkConnection(ipAddress, portNum);
      setIsConnected(result.connected);
      setConnectedHostname(result.hostname || null);
      if (result.connected) {
        await addLog(
          "success",
          `Connected to ${result.hostname || ipAddress}:${portNum}`
        );
      }
    } catch (error) {
      setIsConnected(false);
      setConnectedHostname(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-discover PC on network
  const handleAutoDiscover = async () => {
    setIsNetworkScanning(true);
    setScanProgress(0);
    setDiscoveredDevices([]);
    await addLog("info", "Scanning hotspot for PCs with shutdown service...");

    try {
      const portNum = parseInt(port, 10) || 3000;

      // Use the hotspot-focused scanner
      const results = await scanHotspotDevices((progress, found) => {
        setScanProgress(progress);
        if (found.length > 0) {
          setDiscoveredDevices([...found]);
        }
      }, portNum);

      if (results.length > 0) {
        setDiscoveredDevices(results);
        await addLog(
          "success",
          `Found ${results.length} PC(s) with shutdown service running`
        );
        // Always show list so user can choose
        setShowDeviceList(true);
      } else {
        // Try the broader scan
        await addLog(
          "info",
          "Quick scan found nothing, trying broader scan..."
        );

        const broadResults = await scanNetwork((progress, found) => {
          setScanProgress(progress);
          if (found.length > 0) {
            setDiscoveredDevices([...found]);
          }
        }, portNum);

        if (broadResults.length > 0) {
          setDiscoveredDevices(broadResults);
          await addLog(
            "success",
            `Found ${broadResults.length} PC(s) with shutdown service`
          );
          setShowDeviceList(true);
        } else {
          Alert.alert(
            "No PCs Found",
            "Could not find any PC running the shutdown service.\n\nMake sure:\n1. Your PC is connected to your phone's hotspot\n2. The desktop service is running (npm start)\n3. Port is correct (default: 3000)\n\nTry entering the IP manually. On your PC, run 'ipconfig' and look for the IPv4 address."
          );
          await addLog("warning", "No PCs found with shutdown service");
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      Alert.alert(
        "Scan Error",
        "Failed to scan network. Try entering IP manually."
      );
      await addLog("error", "Network scan failed");
    } finally {
      setIsNetworkScanning(false);
      setScanProgress(0);
    }
  };

  // Handle device selection from discovery
  const handleSelectDevice = async (device: DiscoveredDevice) => {
    setIpAddress(device.ip);
    await AsyncStorage.setItem(STORAGE_KEYS.IP_ADDRESS, device.ip);
    setShowDeviceList(false);
    await addLog("info", `Selected device: ${device.hostname || device.ip}`);

    // Check connection
    setTimeout(checkPCConnection, 100);
  };

  // Refresh connection and status
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedSettings();
    if (connectionMode === "wifi") {
      await checkPCConnection();
    } else {
      // Check Bluetooth connection status
      const connected = await isDeviceConnected();
      setBtConnected(connected);
      setIsConnected(connected);
      if (!connected && btInitialized) {
        await loadPairedDevices();
      }
    }
    setRefreshing(false);
  }, [ipAddress, port, connectionMode, btInitialized]);

  // Handle IP address change
  const handleIPChange = (text: string) => {
    setIpAddress(text);
    AsyncStorage.setItem(STORAGE_KEYS.IP_ADDRESS, text);
  };

  // Handle port change
  const handlePortChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPort(cleaned);
    AsyncStorage.setItem(STORAGE_KEYS.PORT, cleaned);
  };

  // Validate inputs before action
  const validateInputs = (): boolean => {
    if (connectionMode === "wifi") {
      if (!ipAddress) {
        Alert.alert("Error", "Please enter the PC's IP address");
        return false;
      }
      if (!isValidIP(ipAddress)) {
        Alert.alert(
          "Error",
          "Please enter a valid IP address (e.g., 192.168.1.100)"
        );
        return false;
      }
    } else {
      if (!selectedBtDevice) {
        Alert.alert("Error", "Please select a Bluetooth device");
        return false;
      }
      if (!btConnected) {
        Alert.alert("Error", "Please connect to the Bluetooth device first");
        return false;
      }
    }
    if (!secretKey) {
      Alert.alert("Error", "Please set the secret key in Settings");
      return false;
    }
    if (!isConnected) {
      Alert.alert(
        "Error",
        connectionMode === "wifi"
          ? "Cannot connect to PC. Make sure the service is running."
          : "Bluetooth not connected. Please connect first."
      );
      return false;
    }
    return true;
  };

  // Render discovered devices modal
  const renderDeviceListModal = () => (
    <Modal
      visible={showDeviceList}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDeviceList(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Discovered Devices</Text>
          <Text style={styles.modalHint}>
            Select the PC you want to connect to
          </Text>

          <FlatList
            data={discoveredDevices}
            keyExtractor={(item) => item.ip}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => handleSelectDevice(item)}
              >
                <Text style={styles.deviceName}>
                  {item.hostname || "Unknown PC"}
                </Text>
                <Text style={styles.deviceAddress}>
                  {item.ip}:{item.port} ({item.responseTime}ms)
                </Text>
              </TouchableOpacity>
            )}
            style={styles.deviceList}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowDeviceList(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render Bluetooth device picker modal
  const renderDevicePicker = () => (
    <Modal
      visible={showDevicePicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDevicePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Paired Device</Text>
          <Text style={styles.modalHint}>
            Make sure your PC is paired via Bluetooth settings
          </Text>

          {isScanning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading devices...</Text>
            </View>
          ) : btDevices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No paired devices found</Text>
              <Text style={styles.emptyHint}>
                Pair your PC in your phone's Bluetooth settings first
              </Text>
            </View>
          ) : (
            <FlatList
              data={btDevices}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => handleBtConnect(item)}
                >
                  <Text style={styles.deviceName}>
                    {item.name || "Unknown Device"}
                  </Text>
                  <Text style={styles.deviceAddress}>{item.address}</Text>
                </TouchableOpacity>
              )}
              style={styles.deviceList}
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadPairedDevices}
              disabled={isScanning}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDevicePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Save Device Modal
  const renderSaveDeviceModal = () => (
    <Modal
      visible={showSaveDeviceModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSaveDeviceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Save Device</Text>
          <Text style={styles.modalHint}>
            Give this device a name for easy access
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Device name (e.g., My PC, Office Desktop)"
            placeholderTextColor="#999"
            value={newDeviceName}
            onChangeText={setNewDeviceName}
            autoFocus
          />

          <Text style={styles.modalIpText}>
            IP: {ipAddress}:{port}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowSaveDeviceModal(false);
                setNewDeviceName("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: "#34C759" }]}
              onPress={handleSaveDevice}
            >
              <Text style={styles.refreshButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Bluetooth Device Picker Modal */}
      {renderDevicePicker()}
      {/* Discovered Devices Modal */}
      {renderDeviceListModal()}
      {/* Save Device Modal */}
      {renderSaveDeviceModal()}

      {/* Action Buttons - 2x2 Grid */}
      <View style={styles.actionsGrid}>
        <View style={styles.actionRow}>
          <ShutdownButton
            action="shutdown"
            ipAddress={ipAddress}
            secretKey={secretKey}
            port={parseInt(port, 10) || 3000}
            delay={defaultDelay}
            connectionMode={connectionMode}
            bluetoothDevice={selectedBtDevice}
            disabled={!isConnected || isLoading}
            onValidate={validateInputs}
            setLoading={setIsLoading}
          />
          <ShutdownButton
            action="restart"
            ipAddress={ipAddress}
            secretKey={secretKey}
            port={parseInt(port, 10) || 3000}
            delay={defaultDelay}
            connectionMode={connectionMode}
            bluetoothDevice={selectedBtDevice}
            disabled={!isConnected || isLoading}
            onValidate={validateInputs}
            setLoading={setIsLoading}
          />
        </View>
        <View style={styles.actionRow}>
          <ShutdownButton
            action="hibernate"
            ipAddress={ipAddress}
            secretKey={secretKey}
            port={parseInt(port, 10) || 3000}
            delay={defaultDelay}
            connectionMode={connectionMode}
            bluetoothDevice={selectedBtDevice}
            disabled={!isConnected || isLoading}
            onValidate={validateInputs}
            setLoading={setIsLoading}
          />
          <ShutdownButton
            action="logout"
            ipAddress={ipAddress}
            secretKey={secretKey}
            port={parseInt(port, 10) || 3000}
            delay={defaultDelay}
            connectionMode={connectionMode}
            bluetoothDevice={selectedBtDevice}
            disabled={!isConnected || isLoading}
            onValidate={validateInputs}
            setLoading={setIsLoading}
          />
        </View>
      </View>

      {/* Connection Status - Minimal */}
      {!isConnected && (
        <View style={styles.noConnectionBanner}>
          <Text style={styles.noConnectionText}>No device connected</Text>
        </View>
      )}

      {/* Connection Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            connectionMode === "wifi" && styles.modeButtonActive,
          ]}
          onPress={() => handleModeChange("wifi")}
        >
          <Text
            style={[
              styles.modeButtonText,
              connectionMode === "wifi" && styles.modeButtonTextActive,
            ]}
          >
            WiFi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            connectionMode === "bluetooth" && styles.modeButtonActive,
          ]}
          onPress={() => handleModeChange("bluetooth")}
        >
          <Text
            style={[
              styles.modeButtonText,
              connectionMode === "bluetooth" && styles.modeButtonTextActive,
            ]}
          >
            Bluetooth
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status - Minimal */}
      {!isConnected && (
        <View style={styles.noConnectionBanner}>
          <Text style={styles.noConnectionText}>No device connected</Text>
        </View>
      )}

      {/* WiFi Configuration Section */}
      {connectionMode === "wifi" && (
        <View style={styles.section}>
          {/* IP Input Row */}
          <View style={styles.ipRow}>
            <TextInput
              style={[styles.input, styles.ipInput]}
              placeholder="Enter IP address"
              placeholderTextColor="#999"
              value={ipAddress}
              onChangeText={handleIPChange}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.scanButton,
                isNetworkScanning && styles.scanButtonDisabled,
              ]}
              onPress={handleAutoDiscover}
              disabled={isNetworkScanning}
            >
              {isNetworkScanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.scanButtonText}>Scan</Text>
              )}
            </TouchableOpacity>
            {ipAddress && isValidIP(ipAddress) && (
              <TouchableOpacity
                style={styles.addDeviceButton}
                onPress={() => setShowSaveDeviceModal(true)}
              >
                <Text style={styles.addDeviceButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          {isNetworkScanning && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${scanProgress * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Saved Devices List */}
          {savedDevices.length > 0 && (
            <View style={styles.savedDevicesList}>
              {savedDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.savedDeviceItem,
                    ipAddress === device.ip &&
                      isConnected &&
                      styles.savedDeviceItemActive,
                  ]}
                  onPress={() => {
                    handleIPChange(device.ip);
                    handlePortChange(device.port);
                    checkPCConnection();
                  }}
                  onLongPress={() => {
                    Alert.alert("Remove Device", `Remove "${device.name}"?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => removeDevice(device.id),
                      },
                    ]);
                  }}
                >
                  <View style={styles.deviceInfoRow}>
                    <Text style={styles.savedDeviceName}>{device.name}</Text>
                    {ipAddress === device.ip && isConnected && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedBadgeText}>Connected</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.savedDeviceIp}>{device.ip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Bluetooth Configuration Section */}
      {connectionMode === "bluetooth" && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deviceSelector}
            onPress={() => {
              if (btInitialized) {
                loadPairedDevices();
                setShowDevicePicker(true);
              } else {
                initBluetooth();
              }
            }}
          >
            <Text style={styles.deviceSelectorText}>
              {selectedBtDevice
                ? selectedBtDevice.name
                : "Tap to select device"}
            </Text>
            <Text style={styles.deviceSelectorArrow}>{">"}</Text>
          </TouchableOpacity>

          {selectedBtDevice && (
            <TouchableOpacity
              style={[
                styles.connectButton,
                btConnected
                  ? styles.disconnectButton
                  : styles.connectButtonEnabled,
              ]}
              onPress={
                btConnected
                  ? handleBtDisconnect
                  : () => handleBtConnect(selectedBtDevice)
              }
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.connectButtonText}>
                  {btConnected ? "Disconnect" : "Connect"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Sending command...</Text>
        </View>
      )}
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
  logoSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginTop: 8,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#E5E5EA",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  modeButtonTextActive: {
    color: "#000000",
  },
  statusBanner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  connected: {
    backgroundColor: "#34C759",
  },
  disconnected: {
    backgroundColor: "#8E8E93",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  hostName: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
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
  ipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  ipInput: {
    flex: 1,
    marginBottom: 0,
  },
  scanButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  scanButtonDisabled: {
    backgroundColor: "#3A3A3C",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C1C1E",
  },
  progressText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#3C3C43",
  },
  // Bluetooth specific styles
  deviceSelector: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deviceSelectorText: {
    fontSize: 16,
    color: "#000000",
  },
  deviceSelectorArrow: {
    fontSize: 12,
    color: "#8E8E93",
  },
  connectButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  connectButtonEnabled: {
    backgroundColor: "#1C1C1E",
  },
  disconnectButton: {
    backgroundColor: "#3A3A3C",
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  btNote: {
    fontSize: 12,
    color: "#FF9500",
    marginTop: 8,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 16,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 12,
    color: "#8E8E93",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#3C3C43",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#3C3C43",
    fontSize: 16,
    fontWeight: "600",
  },
  // Quick Connect styles
  quickConnectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  quickConnectItem: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  quickConnectItemActive: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
  },
  quickConnectText: {
    fontSize: 13,
    color: "#3C3C43",
    fontFamily: "monospace",
  },
  quickConnectTextActive: {
    color: "#FFFFFF",
  },
  // Saved Devices styles
  savedDevicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  savedDevicesList: {
    marginTop: 8,
  },
  savedDeviceItem: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  savedDeviceItemActive: {
    borderColor: "#1C1C1E",
    backgroundColor: "#F2F2F7",
  },
  savedDeviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  savedDeviceIp: {
    fontSize: 13,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  // Modal input styles
  modalInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 8,
    width: "100%",
  },
  modalIpText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  // Minimal UI styles
  noConnectionBanner: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  noConnectionText: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },
  addDeviceButton: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  addDeviceButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "500",
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  connectedBadge: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  connectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  // Action Grid styles
  actionsGrid: {
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionsContainer: {
    marginTop: 8,
  },
});

export default HomeScreen;
