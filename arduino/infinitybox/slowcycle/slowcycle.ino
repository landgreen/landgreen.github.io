//https://learn.adafruit.com/adafruit-neopixel-uberguide/arduino-library-use
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 9
#define NUM_LEDS 20 //gets a tiny bit hot at 64
#define BRIGHTNESS 100
#define WAIT 50

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);


void setup() {
  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0, 0, 0);
  }
  strip.show(); // Initialize all pixels to 'off'
}

int r = 255;
int g = 0;
int b = 0;
int one = 0;

// rainbow wave
void loop() {
  for (int j = 0; j < 255; j++) {
    r--;
    g++;
    drawAll();
  }
  for (int j = 0; j < 255; j++) {
    g--;
    b++;
    drawAll();
  }
  for (int j = 0; j < 255; j++) {
    r++;
    b--;
    drawAll();
  }
}

void drawAll() {
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, r, g, b);
  }
//  lightOne();
  strip.show();
  delay(WAIT);
}

void lightOne(){
  one++;
  if (one > NUM_LEDS*5) one = 0;
    strip.setPixelColor(floor(one/5), b, r, g);
}





//void loop() {
//  for (int i = 0; i < NUM_LEDS/2; i++) {
//    for (int j = 0; j < NUM_LEDS; j++) {
//      strip.setPixelColor(j, 0, 0, 0);
//    }
//    strip.setPixelColor(i, 255, 0, 0);
//    strip.setPixelColor(i + 1, 224, 32, 0);
//    strip.setPixelColor(i + 2, 192, 64, 0);
//    strip.setPixelColor(i + 3, 160, 128, 0);
//    strip.setPixelColor(i + 4, 128, 160, 0);
//    strip.setPixelColor(i + 5, 96, 192, 0);
//    strip.setPixelColor(i + 6, 64, 224, 0);
//    strip.setPixelColor(i + 7, 32, 255, 0);
//
//    strip.setPixelColor(i + 8, 0, 255, 0);
//    strip.setPixelColor(i + 9, 0, 224, 32);
//    strip.setPixelColor(i + 10, 0, 192, 64);
//    strip.setPixelColor(i + 11, 0, 160, 128);
//    strip.setPixelColor(i + 12, 0, 128, 160);
//    strip.setPixelColor(i + 13, 0, 96, 192);
//    strip.setPixelColor(i + 14, 0, 32, 224);
//    strip.setPixelColor(i + 15, 0, 0, 255);
//
//    strip.show();
//    delay(WAIT);
//  }
//
//  for (int i = NUM_LEDS/2; i > 1; i--) {
//    for (int j = 0; j < NUM_LEDS; j++) {
//      strip.setPixelColor(j, 0, 0, 0);
//    }
//    strip.setPixelColor(i, 255, 0, 0);
//    strip.setPixelColor(i + 1, 224, 32, 0);
//    strip.setPixelColor(i + 2, 192, 64, 0);
//    strip.setPixelColor(i + 3, 160, 128, 0);
//    strip.setPixelColor(i + 4, 128, 160, 0);
//    strip.setPixelColor(i + 5, 96, 192, 0);
//    strip.setPixelColor(i + 6, 64, 224, 0);
//    strip.setPixelColor(i + 7, 32, 255, 0);
//
//    strip.setPixelColor(i + 8, 0, 255, 0);
//    strip.setPixelColor(i + 9, 0, 224, 32);
//    strip.setPixelColor(i + 10, 0, 192, 64);
//    strip.setPixelColor(i + 11, 0, 160, 128);
//    strip.setPixelColor(i + 12, 0, 128, 160);
//    strip.setPixelColor(i + 13, 0, 96, 192);
//    strip.setPixelColor(i + 14, 0, 32, 224);
//    strip.setPixelColor(i + 15, 0, 0, 255);
//
//    strip.show();
//    delay(WAIT);
//  }
//}



