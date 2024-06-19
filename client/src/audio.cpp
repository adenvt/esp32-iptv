#include "audio.h"

Audio::Audio()
    : queue(new Queue(AUDIO_BUFFERSIZE * 3, true)), i2sQueue(new QueueHandle_t()), playTask(new TaskHandle_t())
{
}

Audio::~Audio()
{
  delete this->queue;
  delete this->i2sQueue;
  delete this->playTask;
}

void Audio::begin()
{
  if (!this->isInstalled)
  {
    i2s_config_t i2sConfig = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = AUDIO_SAMPLERATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = 1024,
        .use_apll = false,
        .tx_desc_auto_clear = true,
        .fixed_mclk = 0,
    };

    i2s_pin_config_t i2sPinConfig = {
        .bck_io_num = PIN_IIS_BCLK,
        .ws_io_num = PIN_IIS_WCLK,
        .data_out_num = PIN_IIS_DOUT,
        .data_in_num = I2S_PIN_NO_CHANGE,
    };

    i2s_driver_install(I2S_NUM_1, &i2sConfig, 10, this->i2sQueue);
    i2s_set_pin(I2S_NUM_1, &i2sPinConfig);

    this->isInstalled = true;
  }

  i2s_zero_dma_buffer(I2S_NUM_1);
}

void Audio::playSound(void *p)
{
  Audio *self = (Audio *)p;
  size_t byteWritten = 0;

  unsigned long start = millis();

  size_t sampleSize = sizeof(uint16_t) * self->size;
  uint16_t* sample = new uint16_t[self->size];

  for (size_t i = 0; i < self->size; i++)
  {
    sample[i] = (self->data[i] & 0x00FF) << 8;
    sample[i] += 0x8000;
  }

  i2s_write(I2S_NUM_1, sample, sampleSize, &byteWritten, portMAX_DELAY);

  log_d("[AUDIO] Play sound: %dms", millis() - start);

  delete[] sample;
  delete[] self->data;

  self->isPlaying = false;
  self->size = 0;

  vTaskDelete(*self->playTask);
}

void Audio::pushAudio(uint8_t *data, size_t size)
{
  if (!this->isPlaying)
  {
    this->data = new uint8_t[size];
    this->size = size;
    this->isPlaying = true;

    memcpy(this->data, data, size);
    xTaskCreatePinnedToCore(Audio::playSound, "playSound", 4096, this, 1, this->playTask, 0);
  }
}

void Audio::loop()
{
  QueueItem *current = this->queue->current();

  if (current)
  {
    if (millis() < current->start)
      return;

    if (millis() < current->end)
      this->pushAudio(current->data, current->size);

    this->queue->next();
  }
}
