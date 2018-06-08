// https://startingelectronics.org/tutorials/arduino/modules/OLED-128x64-I2C-display/

#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include "DHT.h"

// set the DHT Pin
#define DHTPIN 7

#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// OLED display TWI address
#define OLED_ADDR   0x3C

Adafruit_SSD1306 display(-1);

#if (SSD1306_LCDHEIGHT != 64)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif
const int  WAIT = 10000;
const int WIDTH = 128 - 30;
const int HEIGHTSTART = 16;
const int HEIGHT = 64 - 8;

int x = 0;
int y = HEIGHTSTART;
int Vx = 1;
int Vy = 1;

void setup() {
  dht.begin();
  // initialize and clear display
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  display.clearDisplay();
  display.display();
  display.setTextColor(WHITE);
}

void loop() {

  float h = dht.readHumidity();
  //read temperature in Fahrenheit
  float f = dht.readTemperature(true);
  
  //cycle curser to the right
  x++;
  if (x > 16) x = 0;
  display.setCursor(x, 0);
  display.print("temp(F)");

  display.setCursor(64+x, 0);
  display.print("humid(%)");
  
  display.setCursor(x, HEIGHTSTART);
  display.print(f);
  
  display.setCursor(64+x, HEIGHTSTART);
  display.print(h);
  
  
  display.display(); //show all
  delay(WAIT);
  display.clearDisplay();
  display.display();
  delay(100);
}

