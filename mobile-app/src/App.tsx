/**
 * Remote PC Shutdown App
 *
 * Main entry point for the React Native application.
 * Uses React Navigation for screen management.
 * Includes PIN lock screen for security.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./navigation/AppNavigator";

const STORAGE_KEY_PIN = "@remote_shutdown_app_pin";
const { width, height } = Dimensions.get("window");

interface PinLockScreenProps {
  onUnlock: () => void;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadStoredPin();
  }, []);

  const loadStoredPin = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_PIN);
      if (saved) {
        setStoredPin(saved);
      } else {
        setIsSettingPin(true);
      }
    } catch (e) {
      console.error("Error loading PIN:", e);
      setIsSettingPin(true);
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError("");

      if (newPin.length === 4) {
        if (isSettingPin) {
          if (!confirmPin) {
            setConfirmPin(newPin);
            setPin("");
          } else if (confirmPin === newPin) {
            savePin(newPin);
          } else {
            setError("PINs do not match");
            setConfirmPin("");
            setPin("");
          }
        } else {
          if (newPin === storedPin) {
            onUnlock();
          } else {
            setError("Incorrect PIN");
            setPin("");
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const savePin = async (newPin: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PIN, newPin);
      setStoredPin(newPin);
      setIsSettingPin(false);
      onUnlock();
    } catch (e) {
      console.error("Error saving PIN:", e);
      setError("Failed to save PIN");
    }
  };

  const renderDots = () => {
    return (
      <View style={lockStyles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[lockStyles.dot, i < pin.length && lockStyles.dotFilled]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["", "0", "del"],
    ];

    return (
      <View style={lockStyles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={lockStyles.keypadRow}>
            {row.map((key, keyIndex) => (
              <TouchableOpacity
                key={keyIndex}
                style={[
                  lockStyles.key,
                  key === "" && lockStyles.keyEmpty,
                ]}
                onPress={() => {
                  if (key === "del") {
                    handleDelete();
                  } else if (key !== "") {
                    handleNumberPress(key);
                  }
                }}
                disabled={key === ""}
              >
                <Text style={lockStyles.keyText}>
                  {key === "del" ? "<" : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={lockStyles.container}>
      <View style={lockStyles.content}>
        <Text style={lockStyles.title}>
          {isSettingPin
            ? confirmPin
              ? "Confirm PIN"
              : "Set PIN"
            : "Enter PIN"}
        </Text>
        <Text style={lockStyles.subtitle}>
          {isSettingPin
            ? confirmPin
              ? "Re-enter your 4-digit PIN"
              : "Create a 4-digit PIN to secure the app"
            : "Enter your 4-digit PIN to continue"}
        </Text>

        {renderDots()}

        {error ? <Text style={lockStyles.error}>{error}</Text> : null}

        {renderKeypad()}
      </View>
    </SafeAreaView>
  );
};

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginHorizontal: 10,
  },
  dotFilled: {
    backgroundColor: "#FFFFFF",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 20,
  },
  keypad: {
    marginTop: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  key: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  keyEmpty: {
    backgroundColor: "transparent",
  },
  keyText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return (
      <>
        <StatusBar style="light" />
        <PinLockScreen onUnlock={() => setIsUnlocked(true)} />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
