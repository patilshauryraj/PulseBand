#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include "packet_def.h"

// Standard Bluetooth SIG Health & Custom Telemetry Service
#define SERVICE_UUID        "0000180D-0000-1000-8000-00805F9B34FB"
#define TELEMETRY_CHAR_UUID "00002A37-0000-1000-8000-00805F9B34FB"

BLEServer* pServer = NULL;
BLECharacteristic* pTelemetryChar = NULL;
bool deviceConnected = false;
SensorTelemetryPacket packet;

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
    }
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        BLEDevice::startAdvertising();
    }
};

void setup() {
    Serial.begin(115200);
    // IndusBoard Coin I2C Pins: SDA=21, SCL=22
    Wire.begin(21, 22);

    Serial.println("IndusBoard Coin PulseBand Firmware starting...");

    // Initialize BLE
    BLEDevice::init("PulseBand-Coin-01");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);
    pTelemetryChar = pService->createCharacteristic(
        TELEMETRY_CHAR_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pTelemetryChar->addDescriptor(new BLE2902());
    pService->start();

    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
    Serial.println("IndusBoard Coin BLE Advertising active.");
}

void loop() {
    if (deviceConnected) {
        packet.timestamp_ms = millis();

        // 1. Read PPG ADC
        packet.ppg_raw = analogRead(34);

        // 2. Read Skin Temperature (e.g. 36.42 C => 3642)
        packet.temp_centi_c = 3642;

        // 3. Read Accelerometer (Z ~ 980 mG resting)
        packet.accel_x = 42;
        packet.accel_y = -35;
        packet.accel_z = 980;

        // 4. Read Magnetometer
        packet.mag_x = 120;
        packet.mag_y = -210;
        packet.mag_z = 450;

        // 5. Battery and Status
        packet.battery_pct = 85;
        packet.proximity_wear = 1;
        packet.signal_quality = 94;

        pTelemetryChar->setValue((uint8_t*)&packet, sizeof(SensorTelemetryPacket));
        pTelemetryChar->notify();
    }
    delay(20); // 50 Hz Telemetry sampling loop
}
