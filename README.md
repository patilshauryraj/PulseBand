# PulseBand: Smart Health Band & IoT ML Platform

**PulseBand** is a production-style, commercial-grade full-stack health monitoring ecosystem combining the **IndusBoard Coin** (ESP32-based hardware), a **FastAPI backend API**, a **machine learning inference engine**, and a responsive **mobile dashboard**.

---

## 1. System Architecture

```
                       +-----------------------------------+
                       |    INDUSBOARD COIN (ESP32)        |
                       |  MAX30102 Optical PPG Sensor      |
                       |  NTC / MAX30205 Temperature       |
                       |  MPU6050 6-Axis Motion / IMU      |
                       |  QMC5883L Magnetometer / RTC      |
                       +-----------------------------------+
                                         |
                       (BLE GATT 50Hz / Wi-Fi Telemetry)
                                         v
                       +-----------------------------------+
                       |        PULSEBAND MOBILE APP       |
                       |   (React + TypeScript + Tailwind) |
                       | - Live ECG/PPG Canvas Waveform    |
                       | - Hardware Sensor Center          |
                       | - Fall Alert Safety Countdown     |
                       | - Activity Timeline & Insights    |
                       +-----------------------------------+
                                         |
                       (REST API & WebSocket Broadcast)
                                         v
                       +-----------------------------------+
                       |       FASTAPI BACKEND SERVER      |
                       | - JWT & OAuth2 Security           |
                       | - Digital Signal Processing (DSP) |
                       | - Activity Random Forest Model    |
                       | - Hybrid Fall Detection Engine    |
                       | - Real-time WebSocket Broker      |
                       +-----------------------------------+
                                         |
                       +-----------------------------------+
                       |       POSTGRESQL / SQLITE DB      |
                       | - Relational Schema (14 Tables)   |
                       | - Indexed Timeseries Telemetry    |
                       +-----------------------------------+
```

---

## 2. Quick Start Guide (Windows)

The platform is pre-configured for zero-friction local execution.

### Single-Click Start
In PowerShell, navigate to the project directory:
```powershell
cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand
.\start_all.ps1
```
This automatically boots:
1. **FastAPI Backend Server**: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Swagger Docs at `/docs`)
2. **Mobile Application**: [http://localhost:3000](http://localhost:3000)

### Manual Startup
- **Start Backend**:
  ```powershell
  cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand
  .\start_backend.ps1
  ```
- **Start Mobile Client**:
  ```powershell
  cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand
  .\start_mobile.ps1
  ```

---

## 3. Demo / Simulation Mode vs. Hardware Mode

- **Simulation Mode (Default)**: Generates realistic physiological streams with smooth transitions, diurnal variation, and harmonic movement without jumping randomly. Clearly labeled with the **Demo Data** badge.
- **Hardware Mode**: Connects directly over Bluetooth Low Energy (BLE) to the IndusBoard Coin running `firmware/indusboard_coin/indusboard_coin.ino`.

---

## 4. Machine Learning & DSP Pipeline

- **PPG Signal Processor**: Moving average baseline wander suppression, refractory systolic peak detection, and continuous Signal Quality Index (SQI) calculation.
- **Activity Classification Model**: Random Forest Classifier trained on sliding windows of 3-axis accelerometer features (`mean`, `std`, `magnitude`, `energy`, `variance`, `zero_crossings`). Classes: `RESTING`, `STATIONARY`, `WALKING`, `RUNNING`, `ACTIVE`.
- **Hybrid Fall Detection**: Combines peak impact vector deceleration (> 2.8G) with post-impact immobility analysis (< 0.18G std dev) triggering a safety countdown modal.
- **Health Anomaly Engine**: Detects deviations exceeding 2.4 sigma against the user's personal baseline.

---

## 5. Default Credentials & Seed Data

- **Demo User**: `demo@pulseband.io`
- **Password**: `pulseband123`
- **Paired Device**: `COIN-INDUS-01` (Firmware `v1.0.4`, 85% Battery)

---

## 6. 3D WebGL CAD Viewer & Engineering Telemetry Simulator

The screenless physical hardware stack-up of PulseBand (housing the IndusBoard Coin microcontroller) can be inspected in real-time using the interactive WebGL CAD application:

- **Location**: `C:\Users\Dell\.gemini\antigravity\scratch\PulseBand-CAD`
- **Dev Server**: [http://localhost:3002](http://localhost:3002)
- **Startup Command**:
  ```powershell
  cd C:\Users\Dell\.gemini\antigravity\scratch\PulseBand-CAD
  npm run dev
  ```
- **Key Features**:
  1. **Parametric 3D Stack-up**: Matte PC/ABS top shell (screenless), Carrier PCB, IndusBoard Coin (ESP32), ERM haptic coin motor, Li-Po 180mAh battery, Sensor PCB (MAX30102 + NTC + MPU6050), Sapphire optical window, Bottom shell with magnetic pogo charging pins, and silicone strap.
  2. **Exploded View Mode**: Smooth Z-axis translation separating internal layers with inspection callouts.
  3. **Cross Section Mode**: Interactive GPU clipping plane for internal clearance and thermal review.
  4. **Component Inspector**: Hover/click selection detailing physical dimensions, bus interfaces (I2C, SPI, GPIO), current draw, and component roles.
  5. **Telemetry Phone Mockup**: Live companion screen showing synthetic 50Hz PPG waveform, skin temperature, and on-device ML activity classification.

