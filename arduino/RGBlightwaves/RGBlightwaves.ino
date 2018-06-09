//https://learn.adafruit.com/adafruit-neopixel-uberguide/arduino-library-use
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 6
#define NUM_LEDS 256
#define BRIGHTNESS 20

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
}

int pos = 0;
_Bool forward = true;
int width = 128;
uint8_t wait = 30;


//void loop() {
//  if (forward) {
//    pos++;
//    for (int i = 0; i < width; i++) {
//      strip.setPixelColor(pos + i, 255 - 10 * i, 0, 0);
//    }
//    strip.setPixelColor(pos - width, 0, 0, 0);
//    if (pos > NUM_LEDS + width) {
//      forward = false;
//    }
//  } else {
//    pos--;
//    for (int i = 0; i < width; i++) {
//      strip.setPixelColor(pos - i, 255 - 10 * i, 0, 0);
//    }
//    strip.setPixelColor(pos + width, 0, 0, 0);
//    if (pos < 0) {
//      forward = true;
//    }
//  }
//  strip.show();
//  delay(wait);
//}


// rainbow wave
void loop() {
  if (forward) {
    pos++;
    for (int i = 0; i < width; i++) {
      if (i < width) {
        strip.setPixelColor(pos - i, 255 -  i, i,  i);
      } else {
        strip.setPixelColor(pos - i, 255 - i, 255 - i, i);
      }
    }
    if (pos > NUM_LEDS + width) {
      forward = false;
    }
  } else {
    pos--;
    for (int i = 0; i < width; i++) {
      if (i < width) {
        strip.setPixelColor(pos - i, 255 - i,  i,  i);
      } else {
        strip.setPixelColor(pos - i, 255 - i, 255 - i, i);
      }
    }
    if (pos < 0) {
      forward = true;
    }
  }
  strip.show();
  delay(wait);
}
//
//int countBinary = 0;
//int SCALE = 11;
//int GAP = 3;
//void loop() {
//  countBinary++;
//  for (int i = 0; i < 20; i++)
//  {
//    if (bitRead(countBinary, i) == 1)
//    {
//      for (int j = 0; j < SCALE-GAP; j++){
//        strip.setPixelColor(i*SCALE+j, colorRed, colorGreen, colorBlue);
//      }
//    }
//    else
//    {
//      for (int j = 0; j < SCALE-GAP; j++){
//        strip.setPixelColor(i*SCALE+j, 0, 0, 0);
//      }
//    }
//  }
//  strip.show();
//  delay(100);
//}





