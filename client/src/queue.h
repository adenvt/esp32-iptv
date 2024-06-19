#ifndef Queue_h
#define Queue_h

#include <Arduino.h>

class QueueItem
{
public:
  uint8_t* data;
  size_t size;

  unsigned long start;
  unsigned long end;

  QueueItem* next = NULL;

  QueueItem(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end);
  ~QueueItem();
};


class Queue
{
protected:
  boolean useSize;

  size_t size = 0;
  size_t capacity;

  QueueItem* head = NULL;
  QueueItem* tail = NULL;
public:
  Queue(size_t maxSize = 5, boolean useSize = false);
  ~Queue();

  QueueItem* current() const;
  boolean isEmpty() const;
  boolean isFull() const;

  void add(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end);
  void next();
  void clear();
};

#endif
