#pragma once

#ifndef Audio_h
#define Audio_h

#include <Arduino.h>
#include <driver/i2s.h>
#include "queue.h"
#include "utils.h"
#include "pin_config.h"

class Audio
{
protected:
  QueueHandle_t *i2sQueue;
  TaskHandle_t *playTask;

  uint8_t *data = NULL;
  size_t size = 0;

  unsigned long flustAt = 0;

  boolean isPlaying = false;
  boolean isInstalled = false;

  void pushAudio(uint8_t *data, size_t size);

public:
  Audio();
  ~Audio();

  Queue *queue;

  void begin();
  void loop();

  static void playSound(void *p);
};

#endif
