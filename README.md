# 🖥️ Remote PC Shutdown System

A complete solution for remotely controlling your Windows PC from your smartphone. Built with React Native (Expo) for the mobile app and Node.js/Express for the desktop service.

## ✨ Features

- **📱 Mobile App**: Clean, intuitive interface to control your PC
- **📶 WiFi Mode**: Connect via phone hotspot (HTTP)
- **🔵 Bluetooth Mode**: Connect via Bluetooth (RFCOMM/SPP)
- **🔌 Shutdown**: Immediately or with a delay
- **🔄 Restart**: Restart your PC remotely
- **😴 Sleep**: Put your PC to sleep
- **🚫 Cancel**: Cancel scheduled shutdown/restart
- **📊 System Info**: View PC status, uptime, memory usage
- **🔐 Secure**: Shared secret key authentication
- **💾 Persistent Settings**: Saves your configuration locally

## 🔗 Connection Modes

### 📶 WiFi Mode (HTTP)

- Uses your phone's mobile hotspot
- PC connects to phone's WiFi
- Communication via HTTP REST API
- Works with Expo Go (no build required)

### 🔵 Bluetooth Mode (RFCOMM)

- Direct Bluetooth serial connection
- No WiFi or hotspot required
- Pair devices via Windows Bluetooth settings
- **Requires development build** (not Expo Go)

## 🏗️ Project Structure

```
remote-shutdown/
├── mobile-app/                 # React Native (Expo) mobile application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ShutdownButton.tsx
│   │   ├── screens/           # App screens
│   │   │   ├── HomeScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── services/          # API communication
│   │   │   ├── api.ts         # WiFi HTTP client
│   │   │   └── bluetoothService.ts  # Bluetooth client
│   │   ├── navigation/        # Navigation setup
│   │   │   └── AppNavigator.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useDevices.ts
│   │   ├── types/             # TypeScript definitions
│   │   │   └── index.ts
│   │   └── App.tsx            # App entry point
│   ├── app.json               # Expo configuration
│   ├── package.json
│   └── tsconfig.json
│
├── desktop-service/            # Node.js desktop service
│   ├── src/
│   │   ├── server.ts          # Express server entry point
│   │   ├── controllers/       # Request handlers
│   │   │   └── shutdownController.ts
│   │   ├── routes/            # API routes
│   │   │   └── index.ts
│   │   ├── services/          # Business logic
│   │   │   ├── systemService.ts
│   │   │   └── bluetoothServer.ts  # Bluetooth RFCOMM server
│   │   ├── middleware/        # Auth middleware
│   │   │   └── auth.ts
│   │   ├── utils/             # Utility functions
│   │   │   └── shutdown.ts
│   │   └── types/             # TypeScript definitions
│   │       └── index.ts
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ installed on your Windows PC
- **npm** or **yarn** package manager
- **Expo Go** app on your smartphone (for WiFi mode development)
- For WiFi: Phone and PC must be on **same network** (phone hotspot)
- For Bluetooth: Windows Bluetooth enabled, devices paired

### 1️⃣ Setup Desktop Service (Windows PC)

```bash
# Navigate to desktop service folder
cd desktop-service

# Install dependencies
npm install

# Optional: Install Bluetooth support (requires Visual Studio Build Tools)
# npm install bluetooth-serial-port

# Start the service
npm start
```

The service will display connection information:

```
════════════════════════════════════════════════════════════
🖥️  Remote PC Shutdown Service Started
════════════════════════════════════════════════════════════

📡 WiFi (HTTP) Server:
   Listening on: http://0.0.0.0:3000
   Local IP: 192.168.43.100
   Mobile app URL: http://192.168.43.100:3000

🔵 Bluetooth Server:
   Status: Running
════════════════════════════════════════════════════════════
```

### 2️⃣ Setup Mobile App

```bash
# Navigate to mobile app folder
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npm start
```

Then scan the QR code with Expo Go app on your phone.

### 3️⃣ Connect & Control

#### WiFi Mode

1. **Enable your phone's hotspot** and connect your PC to it
2. **Find your PC's IP**: Run `ipconfig` in Command Prompt, look for IPv4 Address under Wi-Fi
3. **Open the app** and select **WiFi** mode
4. **Enter the IP** in the mobile app's Home screen
5. **Enter the secret key** (default: `a`)
6. **Tap an action button** to control your PC!

#### Bluetooth Mode

1. **Pair your phone with your PC** via Windows Bluetooth settings
2. **Build the app** (Bluetooth won't work in Expo Go):
   ```bash
   cd mobile-app
   npx expo prebuild
   npx expo run:android
   ```
3. **Open the app** and select **Bluetooth** mode
4. **Select your PC** from the paired devices list
5. **Tap Connect** to establish Bluetooth connection
6. **Enter the secret key** (same as WiFi mode)
7. **Tap an action button** to control your PC!

## ⚙️ Configuration

### Desktop Service (.env file)

Create or edit `.env` in `desktop-service/`:

```env
# Port to listen on (default: 3000)
PORT=3000

# Shared secret key - CHANGE THIS!
SHARED_SECRET_KEY=your-secure-secret-key

# Enable Bluetooth server (default: true)
# Set to 'false' to disable Bluetooth
ENABLE_BLUETOOTH=true
```

### Mobile App

The app stores settings locally on your device. Configure via:

- **Home Screen**: IP address, port, secret key
- **Settings Screen**: Default delay, confirmation toggles

## 📡 API Endpoints

| Method | Endpoint        | Description             |
| ------ | --------------- | ----------------------- |
| GET    | `/health`       | Health check (no auth)  |
| POST   | `/api/shutdown` | Shutdown the PC         |
| POST   | `/api/restart`  | Restart the PC          |
| POST   | `/api/sleep`    | Put PC to sleep         |
| POST   | `/api/cancel`   | Cancel scheduled action |
| GET    | `/api/status`   | Get system info         |

### Request Body (for POST endpoints)

```json
{
  "key": "your-secret-key",
  "delay": 30, // Optional: seconds to wait
  "force": false // Optional: force close apps
}
```

## 🔒 Security Notes

- **Change the default secret key** before using in production
- The service **only accepts local network connections**
- All commands require authentication
- Consider using a strong, unique secret key

## 📱 How Hotspot Connectivity Works

### WiFi Mode

1. **Enable hotspot** on your phone (creates a local WiFi network)
2. **Connect PC to hotspot** (PC gets an IP like 192.168.43.x)
3. **Phone and PC are now on same network**
4. App sends HTTP requests to PC's local IP
5. Service receives requests and executes commands

```
[Phone] ──HTTP POST──> [PC Service]
   │                        │
   └── Same WiFi Network ───┘
       (Phone Hotspot)
```

### Bluetooth Mode

1. **Pair devices** via Windows Bluetooth settings
2. **App connects** via Bluetooth Serial (RFCOMM/SPP)
3. **Commands sent** as serial data: `action:key:options`
4. **Service receives** and executes commands
5. **Response sent** back as JSON

```
[Phone] ──Bluetooth RFCOMM──> [PC Bluetooth Server]
   │                               │
   └── Direct Bluetooth Link ──────┘
       (No WiFi Required)
```

## 🛠️ Development

### Desktop Service

```bash
cd desktop-service
npm run dev      # Start with auto-reload (ts-node-dev)
npm run build    # Compile TypeScript
npm run serve    # Run compiled JS
```

### Mobile App

```bash
cd mobile-app
npm start        # Start Expo
npm run android  # Android emulator
npm run ios      # iOS simulator
```

## 📦 Building for Production

### Desktop Service

```bash
cd desktop-service
npm run build
# Use PM2 or Windows Task Scheduler to run dist/server.js
```

### Mobile App (APK/IPA)

```bash
cd mobile-app
npx expo build:android  # Build APK
npx expo build:ios      # Build IPA
```

Or use EAS Build:

```bash
npx eas build --platform android
npx eas build --platform ios
```

## 🐛 Troubleshooting

### WiFi Mode Issues

| Issue               | Solution                                            |
| ------------------- | --------------------------------------------------- |
| Can't connect to PC | Check if both devices are on same network (hotspot) |
| Invalid IP error    | Run `ipconfig` and use the correct IPv4 address     |
| Auth failed         | Make sure secret keys match in app and service      |
| Timeout errors      | Check if firewall is blocking port 3000             |
| Service won't start | Run `npm install` and check for errors              |

### Bluetooth Mode Issues

| Issue                  | Solution                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Can't find PC          | Make sure PC is paired in phone's Bluetooth settings            |
| Connection fails       | Restart Bluetooth on both devices, re-pair if needed            |
| Module not installed   | Run `npm install bluetooth-serial-port` in desktop-service      |
| Build tools error      | Install Visual Studio Build Tools for native compilation        |
| Not working in Expo Go | Bluetooth requires a development build, run `npx expo prebuild` |

### Windows Firewall

If you have connection issues, allow the service through firewall:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js or allow port 3000

### Installing Bluetooth Support (Windows)

The `bluetooth-serial-port` package requires native compilation:

```bash
# Install Windows Build Tools (run as Administrator)
npm install --global windows-build-tools

# Or install Visual Studio with C++ workload

# Then install the Bluetooth package
cd desktop-service
npm install bluetooth-serial-port
```

## 📄 License

MIT License - Feel free to use and modify!
