# PulseBand: Master Technical Architecture & Product Documentation
**Version:** 2.5.0 • **Project Status:** Production-Ready • **Target Hardware:** IndusBoard Coin (ESP32-S3)

---

## Executive Summary

**PulseBand** is a medical-grade, screenless wearable health monitoring ecosystem and IoT + ML platform. Designed specifically around the **IndusBoard Coin** (a circular ESP32-S3 IoT microcontroller), PulseBand continuously captures high-frequency optical photoplethysmogram (PPG), multi-axis inertial motion (IMU), and skin temperature telemetry. 

The system couples on-edge digital signal processing and embedded BLE streaming with a high-throughput **FastAPI backend**, a **PostgreSQL/SQLite** time-series data warehouse, real-time **WebSockets**, scikit-learn/1D-CNN **machine learning inference**, an interactive **3D WebGL CAD engineering simulator**, and a **mobile web application** with Google Sign-In and autonomous simulation capabilities.

---

## 1. System Architecture Diagram

```
+===================================================================================================+
|                                    HARDWARE LAYER (Wearable Device)                                |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                           INDUSBOARD COIN (ESP32-S3 Dual-Core 240MHz)                     |   |
|   |  - MAX30102 (Optical Red + IR LEDs, 50-100Hz PPG, SpO2)                                   |   |
|   |  - MPU6050 / LSM6DSOX (6-Axis IMU: Accelerometer +/-16g, Gyroscope +/-2000 dps)           |   |
|   |  - NTC Thermistor / MAX30205 (Medical-grade skin contact temperature +/-0.1C)             |   |
|   |  - ERM Coin Vibration Motor (Haptic feedback for alerts)                                  |   |
|   |  - 180mAh Li-Po Battery + PMIC Fuel Gauge + Magnetic Pogo Pins                             |   |
|   +-------------------------------------------------------------------------------------------+   |
+===================================================================================================+
                                  |                                       |
                   (BLE GATT 50Hz Binary Packet)           (Wi-Fi Direct Telemetry / Sync)
                                  |                                       |
                                  v                                       v
+===================================================================================================+
|                                      APPLICATION & CLIENT LAYER                                   |
|                                                                                                   |
|   +---------------------------------------------------+   +-----------------------------------+   |
|   |              PULSEBAND MOBILE CLIENT              |   |     3D WEBGL CAD & TELEMETRY      |   |
|   |          (React 18 + TypeScript + Vite)           |   |            SIMULATOR              |   |
|   |                     Port: 3000                    |   |    (Three.js + R3F + Drei + Vite) |   |
|   |                                                   |   |              Port: 3002           |   |
|   |  * Google Sign-In & JWT Auth                      |   |                                   |   |
|   |  * Live Canvas PPG Waveform (Systolic + Notch)    |   |  * 1:1 Parametric 3D Stack-up     |   |
|   |  * Trends (1H, 6H, 24H, 7D Recharts AreaChart)   |   |  * Exploded View & Slice Plane    |   |
|   |  * PPG-Net ML Insights & Arrhythmia Scanner       |   |  * Component Inspector & Buses    |   |
|   |  * 6-Axis Motion, Steps, Cadence & Calories       |   |  * Interactive Phone Mockup       |   |
|   |  * High-G Fall 10s Emergency SOS Countdown        |   |  * Live 50Hz Telemetry Link       |   |
|   |  * Device Self-Tests & Recalibration              |   +-----------------------------------+   |
|   |  * Personal Baselines & Settings                  |                                           |
|   |  * Dual-Engine: BLE Live vs. Synthetic Generator  |                                           |
|   +---------------------------------------------------+                                           |
+===================================================================================================+
                                  |
               (HTTPS REST APIs & Bi-Directional WebSockets)
                                  |
                                  v
+===================================================================================================+
|                                        BACKEND CLOUD LAYER                                        |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                        FASTAPI ASYNC ENGINE (Python 3.11+ / Uvicorn)                      |   |
|   |                                         Port: 8000                                        |   |
|   |                                                                                           |   |
|   |  * Auth: OAuth2 Bearer, Google Sign-In Token Verifier, BCrypt, JWT Claims                 |   |
|   |  * REST Routers: /auth, /users, /devices, /health, /activity, /ml, /analytics, /admin     |   |
|   |  * WebSocket Broadcast Hub: /ws/telemetry, /ws/alerts                                     |   |
|   |  * DSP Pipeline: Bandpass Butterworth (0.5-5Hz), Baseline Wander Removal, Peak SQI        |   |
|   |  * Anomaly Engine: Dynamic 2.4-Sigma Gaussian Personal Baseline Outlier Detection         |   |
|   |  * Fall Detection Engine: Vector Magnitude Deceleration (>2.8g) + Post-Fall Immobility    |   |
|   |  * Activity Model: Random Forest (Rest, Walk, Run, Stationary, Active)                    |   |
|   |  * PPG-Net: 1D-CNN Rhythm Classification (Normal, Tachycardia, Bradycardia, Arrhythmia)   |   |
|   +-------------------------------------------------------------------------------------------+   |
+===================================================================================================+
                                  |
                    (SQLAlchemy ORM + Alembic Pool)
                                  |
                                  v
+===================================================================================================+
|                                         PERSISTENCE LAYER                                         |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                        POSTGRESQL 15+ (Production) / SQLITE (Dev)                         |   |
|   |                                                                                           |   |
|   |  * Users & Auth Providers (Google, Email)      * Daily Aggregates & Step Logs             |   |
|   |  * Device Provisioning & Firmware State        * ML Baseline Calibration Table            |   |
|   |  * High-Frequency Telemetry Timeseries         * Emergency Safety Contacts & SOS Events   |   |
|   |  * Anomaly Events & Arrhythmia Audit Trail     * Notifications Queue & Logs               |   |
|   +-------------------------------------------------------------------------------------------+   |
+===================================================================================================+
```

---

## 2. Complete Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Microcontroller** | IndusBoard Coin (ESP32-S3) | Xtensa LX7 @ 240MHz | Dual-core compute, BLE 5.0, 2.4GHz Wi-Fi, low power sleep |
| **Firmware Framework** | C++ / Arduino / FreeRTOS | 2.0.14+ | Real-time task scheduling, 50Hz sensor polling, BLE GATT notifications |
| **Sensors** | MAX30102, MPU6050, NTC | I2C / ADC | Optical PPG (Red/IR), 6-DOF inertial motion, skin temperature |
| **Backend Framework** | FastAPI | 0.109+ | High-concurrency async ASGI REST & WebSocket services |
| **ASGI Server** | Uvicorn | 0.27+ | Lightning-fast async server with worker process management |
| **Programming Language** | Python | 3.11+ | Backend, DSP signal processing, and ML training pipelines |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy | 2.0+ | Timeseries indexing, ACID compliance, relation mapping |
| **Migrations** | Alembic | 1.13+ | Version-controlled database schema evolution |
| **Authentication** | JWT (python-jose), Passlib (bcrypt) | 3.3.0 | Secure token authentication, OAuth2 password flow, Google verification |
| **Signal Processing** | SciPy, NumPy | 1.12+ | Digital Butterworth filtering, refractory peak detection, SQI |
| **Machine Learning** | Scikit-Learn, Joblib | 1.4+ | Random Forest activity classification, Gaussian baselines |
| **Deep Learning** | PyTorch / 1D-CNN (PPG-Net) | 2.1+ | Pulse morphology classification and arrhythmia detection |
| **Mobile Client** | React 18, TypeScript, Vite | 5.4+ | Fast HMR, type-safe mobile frontend web app (Port 3000) |
| **Styling & Icons** | Tailwind CSS, Lucide React | 3.4+ | Custom cyberpunk/medical dark design tokens, SVG icon library |
| **Charts & Visuals** | Recharts | 2.12+ | Responsive SVG/Canvas time-series charts (Area, Line, Reference corridors) |
| **3D CAD WebGL Simulator** | Three.js, React Three Fiber, Drei | 0.160+ | Interactive 3D mechanical hardware stack-up & thermal inspector (Port 3002) |
| **Containerization** | Docker, Docker Compose | 3.8 | Multi-container production deployment for Backend, DB, and Web |

---

## 3. Detailed Component Breakdown

### 3.1. Firmware & Hardware Layer (`firmware/indusboard_coin`)
- **IndusBoard Coin Form Factor**: Circular coin-sized form factor (diameter 28mm) optimized for screenless wristwear.
- **Sensor Drivers**:
  - `MAX30102`: Configured with 400uA LED current, 411us pulse width, sample rate 100Hz, 18-bit ADC resolution.
  - `MPU6050`: Configured for +/-4g accelerometer range and +/-500 dps gyroscope sensitivity.
  - `NTC Thermistor / MAX30205`: Continuous skin temperature monitoring with 0.05°C precision.
- **BLE GATT Profile**:
  - Custom Service UUID: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
  - Telemetry Characteristic UUID: `beb5483e-36e1-4688-b7f5-ea07361b26a8`
  - Control / Calibration Characteristic UUID: `beb5483e-36e1-4688-b7f5-ea07361b26a9`
- **Packet Structure (`packet_def.h`)**: Compact binary packet (24 bytes) containing timestamp, red/IR raw samples, 3-axis accel, 3-axis gyro, temperature, and battery percentage.

---

### 3.2. Backend Services & APIs (`backend/app`)
- **Authentication Router (`/auth`)**:
  - `POST /auth/register`: Creates a new user profile with medical baseline defaults.
  - `POST /auth/login`: Standard OAuth2 form-data authentication returning access and refresh JWT tokens.
  - `POST /auth/google`: Accepts Google OAuth2 ID tokens, verifies credentials, and issues session tokens.
  - `GET /auth/me`: Fetches active authenticated user payload.
- **Device Management (`/devices`)**:
  - `POST /devices/pair`: Pair device with MAC/BLE address and hardware serial.
  - `GET /devices/status`: Hardware status, battery level, RSSI, and sensor self-test results.
  - `POST /devices/calibrate`: Initiates zero-point optical and accelerometer recalibration.
- **Health Telemetry (`/health`)**:
  - `POST /health/telemetry`: Ingestion endpoint for batch telemetry packets from hardware or mobile bridge.
  - `GET /health/vitals/current`: Instantaneous vitals (HR, SpO2, HRV rMSSD, Skin Temp, Respiration Rate).
  - `GET /health/trends`: Historical aggregation supporting intervals: `1h`, `6h`, `24h`, `7d`, `30d`.
- **Machine Learning & DSP (`/ml`)**:
  - `POST /ml/predict-activity`: Real-time classification on sliding 2.5s IMU windows.
  - `POST /ml/detect-anomalies`: Evaluation against individual 30-day baseline parameters.
  - `POST /ml/analyze-ppg`: Deep 1D-CNN wave morphology analysis for arrhythmia episodes.
- **Safety & Alerts (`/notifications`)**:
  - `POST /notifications/fall-alert`: Dispatches critical alert, triggers SMS/webhook to emergency contact.
  - `GET /notifications/unread`: Retrieves pending notifications for user display.
- **WebSockets (`/ws`)**:
  - `/ws/telemetry`: Sub-second streaming channel delivering live 50Hz optical waveforms and calculated vitals.
  - `/ws/alerts`: Instant priority channel for fall emergency countdowns and high-sigma anomalies.

---

### 3.3. Mobile Client Application (`PulseBand/mobile`)
- **Port**: `3000` (`http://localhost:3000/`)
- **Design Aesthetic**:
  - Medical cyberpunk theme with high-contrast readability.
  - Deep obsidian background (`#080B12`), dark card surfaces (`#111826`, `#182236`), cyan/teal accents (`#3EE8D3`), and alert crimson (`#F43F5E`).
- **Features & Screens**:
  1. **Authentication Screen (`AuthScreen.tsx`)**:
     - Standard email & password login/register.
     - **"Continue with Google"** with authentic Google branding.
     - **Interactive Google Account Picker Modal** offering immediate one-click testing as *Alex Mercer* or *Dr. Sarah Jenkins*, or entering custom Google credentials.
     - Quick Demo access for instant review without entering credentials.
  2. **Top Status Bar (`TopBar.tsx`)**:
     - Real-time formatted digital clock.
     - Live Bluetooth connectivity and battery level indicators.
     - Clickable user avatar opening the **Profile Modal**.
  3. **User Profile & Safety Contact Modal (`ProfileModal.tsx`)**:
     - User biometrics: Age, Resting HR, Max HR, and Weight.
     - Editable emergency safety contact (Name, Phone number, Relationship).
     - Connected provider badge (`Google Connected` or `Email Verified`).
     - Safe sign-out with confirmation dialog.
  4. **Live Dashboard (`HomeScreen.tsx`)**:
     - Canvas-based real-time 50Hz optical photoplethysmogram (PPG) waveform renderer with systolic peaks and dicrotic notch.
     - Dynamic pulsating heart indicator (`pt-beat`).
     - 4 live telemetry cards: Heart Rate (BPM), SpO2 (%), Skin Temp (°C), and HRV (rMSSD ms).
     - 24-hour summary metrics (Min, Max, Avg, Steps, Active Duration).
     - Interactive Fall Alert test button.
  5. **Trends Screen (`TrendsScreen.tsx`)**:
     - Recharts AreaChart with 1H, 6H, 24H, and 7D time filters.
     - 60–100 BPM reference corridor highlighting normal resting ranges.
     - Anomaly scatter points pinpointing detected arrhythmias.
  6. **PPG-Net Insights (`InsightsScreen.tsx`)**:
     - Model confidence gauge and inference execution state.
     - "Run Analysis" scan simulation with animated progress bar.
     - Expandable historical arrhythmia episodes detailing wave morphology and medical recommendations.
  7. **Activity & Movement (`ActivityScreen.tsx`)**:
     - 6-axis step counter with daily goal percentage ring/bar.
     - Calorie burn, total distance, and active cadence metrics.
     - Rest vs. Walk vs. Run time distribution breakdown.
  8. **Hardware Device Center (`DeviceScreen.tsx`)**:
     - IndusBoard Coin ESP32-S3 telemetry: battery level, BLE signal strength (RSSI), firmware version.
     - Subsystem diagnostics (MAX30102, LSM6DSOX, Flash memory).
     - Sensor calibration and sync trigger.
     - Direct launch button to the **3D CAD WebGL Simulator**.
  9. **Settings Screen (`SettingsScreen.tsx`)**:
     - Profile overview and role badge.
     - Dual-Engine Toggle: `Real Hardware Stream` vs. `Autonomous Simulation Engine`.
     - Force Activity State selector (`Rest`, `Walk`, `Run`, `Bradycardia`, `Tachycardia`).
     - Safety thresholds and Fall SOS toggles.
  10. **High-G Fall Emergency Modal (`FallAlertModal.tsx`)**:
      - Automatic 10-second countdown with warning audio/visual alarm.
      - "I'm OK - Cancel" button to prevent false dispatch.
      - Auto-sends GPS coordinates and contact alert upon expiration.

---

### 3.4. 3D WebGL CAD Viewer & Engineering Simulator (`PulseBand-CAD`)
- **Port**: `3002` (`http://localhost:3002/`)
- **Mechanical Hardware Stack-up (Screenless Wearable)**:
  - **Top Enclosure Shell**: Screenless matte PC/ABS ergonomic curved capsule (42 x 20 x 11.4 mm) with micro-drilled RGB status LED pinhole.
  - **Main Carrier PCB**: 4-layer FR4 green soldermask, ENIG gold pads, power management IC (PMIC), BLE trace antenna clearance.
  - **IndusBoard Coin Module**: Circular core module (28mm dia) with ESP32-S3 dual-core microcontroller, crystal oscillator, and castellated solder pads.
  - **Haptic Engine**: 8mm ERM coin vibration motor for tactile alarms.
  - **Power Source**: 180mAh rechargeable Lithium-Polymer pouch cell with safety PCM.
  - **Sensor Subsystem PCB**: MAX30102 dual optical apertures, MPU6050 6-axis IMU, and medical-grade NTC thermistor.
  - **Optical Interface**: Convex sapphire crystal glass window with dual IR/Red transmission channels.
  - **Bottom Enclosure Shell**: Skin-contact biocompatible casing with 4 gold-plated magnetic pogo charging contacts.
  - **Strap**: Flexible medical-grade fluoroelastomer silicone wristband with quick-release lugs.
- **Interactive Engineering Features**:
  1. **Exploded View Mode**: Smooth slider separating internal layers along the Z-axis with 3D inspection tags.
  2. **Cross-Section View Mode**: Interactive GPU clipping plane allowing review of internal tolerances and thermal clearances.
  3. **Component Inspector**: Click or hover over any layer to inspect physical dimensions, bus interfaces (I2C, SPI, ADC), current draw, and component roles.
  4. **Live Companion Phone Mockup**: On-screen smartphone simulator displaying real-time 50Hz optical waveforms and simulated telemetry.

---

### 3.5. Machine Learning & DSP Intelligence Pipeline

```
Raw PPG / IMU Stream (50-100Hz)
       │
       ▼
┌──────────────────────────────────────────────┐
│       Digital Signal Processing (DSP)        │
│  - 4th-Order Bandpass Butterworth (0.5-5Hz)  │
│  - Moving Average Baseline Drift Removal     │
│  - Refractory Peak Detection (Systolic)      │
│  - Signal Quality Index (SQI > 0.85)         │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Activity Classifier   │   │    Hybrid Fall Detection  │
│  - Random Forest (100 est)│   │  - Vector Mag > 2.8G      │
│  - Features: Mean, Std,   │   │  - Post-Impact Immobility │
│    Energy, Zero Crossings │   │    (< 0.18G std dev)      │
│  - Classes: Rest, Walk,   │   │  - 10s Countdown Trigger  │
│    Run, Stationary        │   └───────────────────────────┘
└──────────────┬────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   Health Anomaly Engine   │   │   PPG-Net 1D-CNN Model    │
│  - Dynamic 2.4-Sigma      │   │  - Multi-Scale Conv1D     │
│    Gaussian Baselines     │   │  - Dicrotic Notch Analysis│
│  - Detects Tachycardia,   │   │  - Arrhythmia Detection   │
│    Bradycardia, Hypoxia   │   │    (AFib, PVC, Normal)    │
└───────────────────────────┘   └───────────────────────────┘
```

1. **Digital Signal Processing (DSP)**:
   - Bandpass filter (0.5Hz–5.0Hz) removes motion artifacts and high-frequency noise.
   - Moving-average baseline wander suppression preserves dicrotic notch morphology.
   - Signal Quality Index (SQI) assesses pulse amplitude and consistency, rejecting corrupted readings.
2. **Activity Classification**:
   - Random Forest model trained on 3-axis accelerometer and gyroscope features.
   - Outputs: `RESTING`, `STATIONARY`, `WALKING`, `RUNNING`, `ACTIVE`.
3. **Hybrid Fall Detection**:
   - Two-phase validation: high-G deceleration impact (> 2.8G) followed by an immobility window (< 0.18G standard deviation for 2 seconds).
   - Eliminates false alarms caused by dropping the device on a table.
4. **Health Anomaly Engine**:
   - Continuously adapts to user's personalized resting baseline.
   - Triggers alerts when metrics exceed 2.4 sigma deviations.

---

## 4. Database Schema (Relational Architecture)

PulseBand utilizes a relational schema optimized for timeseries telemetry and audit trails:

1. **`users`**: User ID, email, password hash, full name, Google auth provider ID, role, age, weight, resting HR, max HR.
2. **`emergency_contacts`**: User ID, contact name, phone number, relationship, notify preferences.
3. **`devices`**: Device ID, MAC address, serial number, user ID, hardware model (`IndusBoard Coin`), firmware version, battery health, paired at.
4. **`telemetry_records`**: Record ID, device ID, timestamp, heart rate, SpO2, skin temperature, HRV rMSSD, respiration rate, step count, SQI score.
5. **`activity_logs`**: Log ID, device ID, start timestamp, end timestamp, activity class, calories burned, confidence.
6. **`anomaly_events`**: Event ID, user ID, timestamp, anomaly type (Tachycardia, Bradycardia, Arrhythmia, Hypoxia, High Fall), severity (`LOW`, `MEDIUM`, `CRITICAL`), baseline deviation, resolved status.
7. **`ppg_waveform_samples`**: Sample ID, record ID, timestamp, raw red channel, raw IR channel, filtered waveform value.
8. **`notifications`**: Notification ID, user ID, type, title, message, is_read, sent_at.

---

## 5. Deployment & Execution Guide

### 5.1. Directory Structure

```
C:\Users\Dell\.gemini\antigravity\scratch\
├── PulseBand/
│   ├── backend/             # FastAPI backend server, ML models, SQLite/PostgreSQL ORM
│   ├── mobile/              # React 18 + TypeScript + Vite mobile client (Port 3000)
│   ├── firmware/            # IndusBoard Coin ESP32-S3 firmware & BLE GATT service
│   ├── ml/                  # ML training scripts, datasets, and exported models
│   ├── admin-dashboard/     # Fleet administration web dashboard
│   ├── docs/                # Architecture, API specifications, and master documents
│   ├── start_all.ps1        # Unified launcher script
│   ├── start_backend.ps1    # Backend launcher
│   └── start_mobile.ps1     # Mobile launcher
└── PulseBand-CAD/           # 3D WebGL CAD Viewer & Hardware Simulator (Port 3002)
```

### 5.2. How to Run All Services

#### Option A: Single-Click PowerShell Launcher
```powershell
cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand
.\start_all.ps1
```

#### Option B: Individual Service Launchers
1. **Launch 3D WebGL CAD Simulator (Port 3002)**:
   ```powershell
   cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand-CAD
   npm run dev
   ```
2. **Launch Mobile Application (Port 3000)**:
   ```powershell
   cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand\mobile
   npm run dev
   ```
3. **Launch FastAPI Backend Server (Port 8000)**:
   ```powershell
   cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand\backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

---

## 6. Access Endpoints & Test Accounts

| Service | Local URL | Description |
|---|---|---|
| **Mobile Client** | [http://localhost:3000/](http://localhost:3000/) | Live mobile health dashboard with Google Sign-In |
| **3D CAD Simulator** | [http://localhost:3002/](http://localhost:3002/) | 3D mechanical stack-up and engineering simulator |
| **Backend API** | [http://127.0.0.1:8000/](http://127.0.0.1:8000/) | FastAPI root endpoint |
| **Swagger UI Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive REST API explorer |
| **OpenAPI Spec** | [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json) | Machine-readable API schema |

### Pre-Configured Test Accounts

- **One-Click Demo Access**: Simply click **"Quick Demo Access"** on the mobile login screen.
- **Google Sign-In**: Click **"Continue with Google"** and select:
  - **Alex Mercer**: `alex.mercer.health@gmail.com`
  - **Dr. Sarah Jenkins**: `sarah.jenkins.cdac@gmail.com`
- **Standard Email & Password**:
  - Email: `demo@pulseband.io`
  - Password: `pulseband123`
