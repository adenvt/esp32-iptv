
#ifndef Decoder_h
#define Decoder_h

#include <Arduino.h>
#include <buffer.h>

extern "C"
{
  typedef void (*DecoderChunkStartCallback)(void);
  typedef void (*DecoderChunkStartCallbackWithCallee)(void* callee);
  typedef void (*DecoderChunkCallback)(const char *type, const size_t size, const uint8_t *data);
  typedef void (*DecoderChunkCallbackWithCallee)(void* callee, const char *type, const size_t size, const uint8_t *data);
}

const char TAG_LIST[4] = {'L', 'I', 'S', 'T'};

const char TAG_MOVI[4] = {'m', 'o', 'v', 'i'};

const char TAG_VIDEO[2] = {'d', 'c'};

const char TAG_AUDIO[2] = {'w', 'b'};

class Decoder
{
protected:
  size_t remainingMovi = 0;

  DecoderChunkCallback onChunk = NULL;
  DecoderChunkStartCallback onChunkStart = NULL;

  void* onChunkStartCallee = NULL;
  DecoderChunkStartCallbackWithCallee onChunkStartWithCallee = NULL;

  void* onChunkCallee = NULL;
  DecoderChunkCallbackWithCallee onChunkWithCallee = NULL;

  void findMovi();
  void findStream();

public:
  MutableBuffer *buffer;

  Decoder();
  ~Decoder();

  void feed(const uint8_t *data, const size_t dataSize);

  void setOnChunk(DecoderChunkCallback callback);
  void setOnChunk(DecoderChunkCallbackWithCallee callback, void* callee);

  void setOnChunkStart(DecoderChunkStartCallback callback);
  void setOnChunkStart(DecoderChunkStartCallbackWithCallee callback, void* callee);

  void begin();
};

#endif
