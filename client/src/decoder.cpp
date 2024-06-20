#include "decoder.h"
#include "utils.h"

Decoder::Decoder()
    : buffer(new MutableBuffer())
{
}

Decoder::~Decoder()
{
  delete buffer;
}

void Decoder::feed(const uint8_t *data, const size_t dataSize)
{
  this->buffer->feed(data, dataSize);

  if (this->remainingMovi > 0 || this->remainingMovi == -1)
    this->findStream();

  if (this->remainingMovi <= 0)
    this->findMovi();
}

void Decoder::setOnChunk(DecoderChunkCallback callback)
{
  this->onChunk = callback;
}

void Decoder::setOnChunk(DecoderChunkCallbackWithCallee callback, void *callee)
{
  this->onChunkCallee = callee;
  this->onChunkWithCallee = callback;
}

void Decoder::setOnChunkStart(DecoderChunkStartCallback callback)
{
  this->onChunkStart = callback;
}

void Decoder::setOnChunkStart(DecoderChunkStartCallbackWithCallee callback, void *callee)
{
  this->onChunkStartCallee = callee;
  this->onChunkStartWithCallee = callback;
}

void Decoder::findMovi()
{
  while (this->buffer->find(TAG_LIST, 4) && this->buffer->left() >= 12)
  {
    uint8_t dSize[4];
    uint8_t dType[4];

    this->buffer->skip(4);        // 'LIST'
    this->buffer->take(dSize, 4); // (size)
    this->buffer->take(dType, 4); // 'movi'

    if (strncmp((char *)dType, TAG_MOVI, 4) == 0)
    {
      this->remainingMovi = readUint32LE(dSize);

      log_d("[DECODER] Found movi: %d", this->remainingMovi);

      if (this->onChunkStart)
        this->onChunkStart();

      if (this->onChunkStartWithCallee)
        this->onChunkStartWithCallee(this->onChunkStartCallee);

      return this->findStream();
    }
  }
}

void Decoder::findStream()
{
  while (this->buffer->left() >= 8)
  {
    uint8_t dSize[4];

    this->buffer->peek(dSize, 4, 4);

    size_t size = readUint32LE(dSize);
    size_t totalSize = 8 + size + (size % 2);

    if (this->buffer->left() < totalSize)
      return;

    uint8_t type[5];
    uint8_t *data = new uint8_t[size];

    this->buffer->take(type, 4);
    this->buffer->skip(4);
    this->buffer->take(data, size);

    if (size % 2)
      this->buffer->skip(1);

    if (this->onChunk)
      this->onChunk((char *)type, size, data);

    if (this->onChunkWithCallee)
      this->onChunkWithCallee(this->onChunkCallee, (char *)type, size, data);

    if (this->remainingMovi > 0)
      this->remainingMovi -= totalSize;

    delete[] data;
  }
}

void Decoder::begin()
{
  this->remainingMovi = 0;

  this->buffer->clear();
}
