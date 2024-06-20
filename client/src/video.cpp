#include "video.h"

Video::Video()
    : queue(new Queue(3)), drawTask(new TaskHandle_t()), tft(new TFT_eSPI()), jpeg(new JPEGDEC())
{
}

Video::~Video()
{
  delete this->queue;
  delete this->drawTask;
  delete this->tft;
}

int Video::drawImage(JPEGDRAW *img)
{
  Video *self = (Video *)img->pUser;

  self->tft->pushImage(img->x, img->y, img->iWidth, img->iHeight, img->pPixels);

  return 1;
}

void Video::feed(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end)
{
  this->queue->add(data, size, start, end);
}

void Video::draw(void *v)
{
  Video *self = (Video *)v;

  unsigned long start = millis();

  self->jpeg->openRAM(self->data, self->size, Video::drawImage);
  self->jpeg->setUserPointer(self);
  self->jpeg->setPixelType(RGB565_BIG_ENDIAN);
  self->jpeg->decode(0, 0, 0);
  self->jpeg->close();

  log_d("[VIDEO] Render image: %dms", millis() - start);

  delete[] self->data;

  self->isDrawing = false;
  self->size = 0;

  vTaskDelete(*self->drawTask);
}

void Video::pushImage(uint8_t *data, size_t size)
{
  if (!this->isDrawing)
  {
    this->data = new uint8_t[size];
    this->size = size;
    this->isDrawing = true;

    memcpy(this->data, data, size);
    xTaskCreatePinnedToCore(Video::draw, "draw", 10000, this, 0, this->drawTask, 0);
  }
}

void Video::begin()
{
  pinMode(PIN_POWER_ON, OUTPUT);
  digitalWrite(PIN_POWER_ON, HIGH);

  this->queue->clear();

  this->tft->begin();
  this->tft->setRotation(3);
  this->tft->fillScreen(TFT_BLACK);
}

void Video::loop()
{
  QueueItem *current = this->queue->current();

  if (current)
  {
    if (millis() < current->start)
      return;

    if (millis() < current->end)
      this->pushImage(current->data, current->size);

    this->queue->next();
  }
}
