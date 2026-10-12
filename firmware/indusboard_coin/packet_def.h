#ifndef PACKET_DEF_H
#define PACKET_DEF_H

#include <stdint.h>

#pragma pack(push, 1)
struct SensorTelemetryPacket {
    uint32_t timestamp_ms;
    int32_t  ppg_raw;         // Photoplethysmogram raw ADC (MAX30102 IR/Red)
    int16_t  temp_centi_c;    // Skin Temperature in Celsius * 100 (e.g. 3645 = 36.45°C)
    int16_t  accel_x;         // mG (1000 = 1.0G)
    int16_t  accel_y;         
    int16_t  accel_z;         
    int16_t  mag_x;           // uT * 10
    int16_t  mag_y;
    int16_t  mag_z;
    uint8_t  battery_pct;     // 0 - 100%
    uint8_t  proximity_wear;  // 1 = Worn, 0 = Off wrist
    uint8_t  signal_quality;  // 0 - 100 Hardware SQI estimation
};
#pragma pack(pop)

#endif
