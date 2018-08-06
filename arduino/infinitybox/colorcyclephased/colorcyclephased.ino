//https://learn.adafruit.com/adafruit-neopixel-uberguide/arduino-library-use
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 9
#define NUM_LEDS 20 //gets a tiny bit hot at 64
#define BRIGHTNESS 100
#define WAIT 10

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

void drawAll(){
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, max(255,r+i*12), max(255,g+i*12), max(255,b+i*12) );
  }
  strip.show();
  delay(WAIT);
}










