#ifndef Utils_h
#define Utils_h

#include <Arduino.h>
#include "driver/i2s.h"

static uint32_t readUint32LE(uint8_t *data, size_t offset = 0)
{
  return (uint32_t)data[offset] | ((uint32_t)data[offset + 1] << 8) | ((uint32_t)data[offset + 2] << 16) | ((uint32_t)data[offset + 3] << 24);
}

#endif
