/**
 * useDevices Hook
 *
 * Custom hook for managing saved devices and checking their connection status.
 * Devices are stored in AsyncStorage for persistence.
 */

import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkConnection } from "../services/api";
import { DeviceConfig } from "../types";

const DEVICES_STORAGE_KEY = "@remote_shutdown_devices";

interface UseDevicesReturn {
  devices: DeviceConfig[];
  loading: boolean;
  error: string | null;
  addDevice: (device: Omit<DeviceConfig, "id">) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  updateDevice: (device: DeviceConfig) => Promise<void>;
  checkDeviceConnection: (device: DeviceConfig) => Promise<boolean>;
  refreshDevices: () => Promise<void>;
}

const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load devices from storage on mount
  useEffect(() => {
    loadDevices();
  }, []);

  // Load devices from AsyncStorage
  const loadDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedDevices = await AsyncStorage.getItem(DEVICES_STORAGE_KEY);
      if (storedDevices) {
        setDevices(JSON.parse(storedDevices));
      }
    } catch (err) {
      setError("Failed to load devices");
      console.error("Error loading devices:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save devices to AsyncStorage
  const saveDevices = async (newDevices: DeviceConfig[]) => {
    try {
      await AsyncStorage.setItem(
        DEVICES_STORAGE_KEY,
        JSON.stringify(newDevices)
      );
      setDevices(newDevices);
    } catch (err) {
      setError("Failed to save devices");
      console.error("Error saving devices:", err);
      throw err;
    }
  };

  // Add a new device
  const addDevice = useCallback(
    async (device: Omit<DeviceConfig, "id">) => {
      const newDevice: DeviceConfig = {
        ...device,
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const newDevices = [...devices, newDevice];
      await saveDevices(newDevices);
    },
    [devices]
  );

  // Remove a device by ID
  const removeDevice = useCallback(
    async (id: string) => {
      const newDevices = devices.filter((device) => device.id !== id);
      await saveDevices(newDevices);
    },
    [devices]
  );

  // Update an existing device
  const updateDevice = useCallback(
    async (updatedDevice: DeviceConfig) => {
      const newDevices = devices.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      );
      await saveDevices(newDevices);
    },
    [devices]
  );

  // Check if a device is reachable
  const checkDeviceConnection = useCallback(
    async (device: DeviceConfig): Promise<boolean> => {
      try {
        const result = await checkConnection(
          device.ipAddress,
          device.port
        );

        // Update last connected time if successful
        if (result.connected) {
          const updatedDevice = {
            ...device,
            lastConnected: new Date().toISOString(),
          };
          await updateDevice(updatedDevice);
        }

        return result.connected;
      } catch (err) {
        return false;
      }
    },
    [updateDevice]
  );

  // Refresh devices list
  const refreshDevices = useCallback(async () => {
    await loadDevices();
  }, []);

  return {
    devices,
    loading,
    error,
    addDevice,
    removeDevice,
    updateDevice,
    checkDeviceConnection,
    refreshDevices,
  };
};

export default useDevices;
