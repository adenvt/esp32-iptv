#ifndef Video_h
#define Video_h

#include <Arduino.h>
#include "JPEGDEC.h"
#include "queue.h"
#include "TFT_eSPI.h"
#include "pin_config.h"

class Video
{
protected:
  TaskHandle_t *drawTask;

  JPEGDEC *jpeg;
  TFT_eSPI *tft;

  uint8_t *data = NULL;
  size_t size = 0;

  boolean isDrawing = false;

  void pushImage(uint8_t *data, size_t size);
public:
  Video(/* args */);
  ~Video();

  Queue *queue;

  void static draw(void *v);
  int static drawImage(JPEGDRAW *pDraw);

  void feed(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end);

  void begin();
  void loop();
};

#endif
