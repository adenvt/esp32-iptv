#pragma once

#define WIFI_SSID             "Internet Gratis"
#define WIFI_PASSWORD         "password wifi"

#define WIFI_CONNECT_WAIT_MAX (30 * 1000)

#define NTP_SERVER1           "pool.ntp.org"
#define NTP_SERVER2           "time.nist.gov"
#define GMT_OFFSET_SEC        (3600 * 8)
#define DAY_LIGHT_OFFSET_SEC  0

#define LV_SCREEN_WIDTH       320
#define LV_SCREEN_HEIGHT      170
#define LV_BUF_SIZE           (LV_SCREEN_WIDTH * LV_SCREEN_HEIGHT)
/*ESP32S3*/
#define PIN_POWER_ON          46

#define PIN_IIC_SDA           18
#define PIN_IIC_SCL           8

#define PIN_APA102_CLK        45
#define PIN_APA102_DI         42

#define PIN_ENCODE_A          2
#define PIN_ENCODE_B          1
#define PIN_ENCODE_BTN        0

#define PIN_LCD_BL            15
#define PIN_LCD_DC            13
#define PIN_LCD_CS            10
#define PIN_LCD_CLK           12
#define PIN_LCD_MOSI          11
#define PIN_LCD_RES           9

#define PIN_BAT_VOLT          4

#define PIN_IIS_BCLK          7
#define PIN_IIS_WCLK          5
#define PIN_IIS_DOUT          6

#define PIN_ES7210_BCLK       47
#define PIN_ES7210_LRCK       21
#define PIN_ES7210_DIN        14
#define PIN_ES7210_MCLK       48

#define PIN_SD_CS             39
#define PIN_SD_SCK            40
#define PIN_SD_MOSI           41
#define PIN_SD_MISO           38

#define SERIAL_BAUDRATE       115200

#define LIVESTREAM
#ifdef LIVESTREAM
#define SERVER_URL            "http://192.168.8.100:8080/stream"
#define VIDEO_FRAMERATE       12
#else
#define SERVER_URL            "http://192.168.8.100:5173/1-minutes.avi"
#define VIDEO_FRAMERATE       15
#endif

#define AUDIO_SAMPLERATE      16000
#define AUDIO_BUFFERSIZE      1350

#define VIDEO_MS              (1000.0 / VIDEO_FRAMERATE)
#define AUDIO_MS              (1000.0 / AUDIO_SAMPLERATE)
