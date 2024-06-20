#pragma once

#ifndef MutableBuffer_h
#define MutableBuffer_h

#include <Arduino.h>

#define BUFFER_INIIAL_SIZE 1024 * 10 /* 10kB */

class MutableBuffer
{
protected:
  size_t size;
  size_t capacity;
  uint8_t *data;

public:
  MutableBuffer(size_t initialCapacity = BUFFER_INIIAL_SIZE);
  ~MutableBuffer();

  void feed(const uint8_t *newData, const size_t size);

  void peek(uint8_t *result, size_t size, size_t offset = 0);
  void take(uint8_t *result, size_t size, size_t offset = 0);
  void skip(size_t size);

  bool find(const char *keyword, size_t keywordSize);
  void clear();

  size_t left() const;
};

#endif
