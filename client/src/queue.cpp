#include "queue.h"

QueueItem::QueueItem(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end)
    : data(new uint8_t[size]), size(size), start(start), end(end)
{
  memcpy(this->data, data, size);
}

QueueItem::~QueueItem()
{
  delete[] this->data;
}

Queue::Queue(size_t maxSize /* =5 */, boolean useSize /* =false */)
    : capacity(maxSize), useSize(useSize)
{
}

Queue::~Queue()
{
  this->clear();
}

QueueItem *Queue::current() const
{
  return this->head;
}

boolean Queue::isEmpty() const
{
  return this->size <= 0;
}

void Queue::add(const uint8_t *data, const size_t size, const unsigned long start, const unsigned long end)
{
  QueueItem *item = new QueueItem(data, size, start, end);

  if (!this->head)
  {
    this->head = item;
    this->tail = item;
  }
  else
  {
    this->tail->next = item;
    this->tail = item;
  }

  this->size += this->useSize ? size : 1;
}

void Queue::next()
{
  QueueItem *current = this->current();

  if (current)
  {
    this->head = current->next;
    this->size -= this->useSize ? current->size : 1;

    if (this->size < 0)
      this->size = 0;

    delete current;
  }
}

void Queue::clear()
{
  while (this->current())
  {
    this->next();
  }
}

boolean Queue::isFull() const
{
  return this->size >= this->capacity;
}
