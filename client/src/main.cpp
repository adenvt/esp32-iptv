/**
 * StreamHTTPClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <StreamLib.h>
#include "pin_config.h"
#include "player.h"

WiFiMulti wifiMulti;
Player player;

void setup()
{
  wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);
}

void loop()
{
  if ((wifiMulti.run() == WL_CONNECTED))
  {

    HTTPClient http;

    log_d("[HTTP] begin...");

    http.begin(SERVER_URL);

    log_d("[HTTP] GET...");

    int httpCode = http.GET();

    if (httpCode > 0)
    {
      log_d("[HTTP] GET... code: %d", httpCode);

      if (httpCode == HTTP_CODE_OK)
      {

#ifdef LIVESTREAM
        ChunkedStreamReader stream(http.getStream());
        player.openStream(&stream);
#else
        player.openStream(http.getStreamPtr());
#endif

        while (http.connected() || player.isBusy())
        {
          player.loop();
        }

        log_d("[HTTP] connection closed or file end.\n");
      }
    }
    else
    {
      log_d("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

  delay(10000);
}
