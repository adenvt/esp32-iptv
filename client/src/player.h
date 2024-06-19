#ifndef Player_h
#define Player_h

#include <Arduino.h>
#include <StreamLib.h>
#include "decoder.h"
#include "video.h"
#include "audio.h"
#include "pin_config.h"

class Player
{
protected:
  Decoder *decoder = NULL;
  Stream *stream = NULL;
  ChunkedStreamReader *chunked = NULL;

  Video *video = NULL;
  Audio *audio = NULL;

  boolean isPlaying = false;

  unsigned long videoStart = 0;
  unsigned long audioStart = 0;

  void begin();
  void loadStream();

public:
  Player();
  ~Player();

  void loop();
  void openStream(Stream *stream);
  void openStream(ChunkedStreamReader *stream);

  boolean isBusy() const;

  static void onDecoderStart(void *p);
  static void onDecoderChunk(void *p, const char *type, const size_t size, const uint8_t *data);
};

#endif
