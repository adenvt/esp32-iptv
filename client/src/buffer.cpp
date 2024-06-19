#include "buffer.h"

MutableBuffer::MutableBuffer(size_t initialCapacity)
    : data(new uint8_t[initialCapacity]), size(0), capacity(initialCapacity)
{
}

MutableBuffer::~MutableBuffer()
{
  delete[] this->data;
}

void MutableBuffer::peek(uint8_t *result, size_t size, size_t offset /* =0 */)
{
  memcpy(result, this->data + offset, size);
}

void MutableBuffer::take(uint8_t *result, size_t size, size_t offset /* =0 =*/)
{
  this->peek(result, size, offset);
  this->skip(offset + size);
}

void MutableBuffer::feed(const uint8_t *newData, const size_t size)
{
  if ((this->size + size) > this->capacity)
  {
    size_t capacity = this->size + size;
    uint8_t *data = new uint8_t[capacity];

    memcpy(data, this->data, this->size);
    delete[] this->data;

    this->data = data;
    this->capacity = capacity;
  }

  memcpy(this->data + this->size, newData, size);

  this->size += size;
}

void MutableBuffer::skip(size_t size)
{
  this->size -= size;
  memmove(this->data, this->data + size, this->size);
}

bool MutableBuffer::find(const char *keyword, size_t kSize)
{
  if (kSize > this->size)
    return false;

  for (size_t i = 0; i < this->size - kSize; i++)
  {
    if (strncmp((char *)(this->data + i), keyword, kSize) == 0)
    {
      this->skip(i);

      return true;
    }
  }

  this->skip(this->size - kSize);

  return false;
}

void MutableBuffer::clear()
{
  this->size = 0;
}

size_t MutableBuffer::left() const
{
  return this->size;
}
