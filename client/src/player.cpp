#include "player.h"

Player::Player()
    : decoder(new Decoder), video(new Video()), audio(new Audio())
{
  this->decoder->setOnChunk(Player::onDecoderChunk, this);
  this->decoder->setOnChunkStart(Player::onDecoderStart, this);
}

Player::~Player()
{
  delete this->decoder;
  delete this->video;
  delete this->audio;
}

void Player::onDecoderStart(void *p)
{
  Player *self = (Player *)p;

  self->videoStart = millis() + round(VIDEO_MS / 2);
  self->audioStart = millis();
}

void Player::onDecoderChunk(void *p, const char *type, const size_t size, const uint8_t *data)
{
  Player *self = (Player *)p;

  log_d("[PLAYER] Got chunk: '%c%c%c%c' (%d)\n", type[0], type[1], type[2], type[3], size);

  if (strncmp(type + 2, TAG_AUDIO, 2) == 0)
  {
    unsigned long start = self->audioStart;
    unsigned long dur = round(size * AUDIO_MS);
    unsigned long end = start + dur;

    self->audio->queue->add(data, size, start, end);

    self->audioStart = max(end, millis());
  }

  if (strncmp(type + 2, TAG_VIDEO, 2) == 0)
  {
    unsigned long start = self->videoStart;
    unsigned long dur = round(VIDEO_MS);
    unsigned long end = start + dur;

    self->video->feed(data, size, start, end);

    self->videoStart = max(end, millis());
  }
}

void Player::begin()
{
  this->decoder->begin();
  this->audio->begin();
  this->video->begin();
}

void Player::loadStream()
{
  Stream *stream = this->chunked ? this->chunked : this->stream;

  if (stream)
  {
    if (this->chunked && !this->chunked->chunkAvailable())
    {
      log_d("[PLAYER] No chunk available");

      return;
    }

    size_t size = stream->available();
    uint8_t buff[1024];

    if (size)
    {
      int c = stream->readBytes(buff, min(size, sizeof(buff)));

      this->decoder->feed(buff, c);
    }
  }
}

void Player::loop()
{
  this->audio->loop();
  this->video->loop();

  if (!this->isBusy())
    this->loadStream();
}

void Player::openStream(Stream *stream)
{
  this->stream = stream;
  this->begin();
}

void Player::openStream(ChunkedStreamReader *stream)
{
  this->chunked = stream;
  this->begin();
}

boolean Player::isBusy() const
{
  return this->video->queue->isFull() || this->audio->queue->isFull();
}
