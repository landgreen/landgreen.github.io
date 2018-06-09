// Adafruit_NeoMatrix example for single NeoPixel Shield.
// Scrolls 'Howdy' across the matrix in a portrait (vertical) orientation.
// https://github.com/adafruit/Adafruit_NeoMatrix

//#include <Adafruit_GFX.h>
//#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>

// defines pins numbers
const int trigPin = 9;
const int echoPin = 10;
// defines variables
long duration;
int distance;


const int  WAIT = 100;
const int PIN = 6;           //pin for LEDS
const int  NUM_LEDS = 256;    //16x16 = 256
const int  BRIGHTNESS = 10;  // 0-100 LED brightness
const int BALLCOLOR[3] = {25,5,10};
int ball[2] = {10, 15}; // ball[x,y]  position
float ballVelocity[2] = {2, 1}; // ballVelocity[Vx,Vy]

// Parameter 1 = number of pixels in strip
// Parameter 2 = pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);


void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0, random(255),  random(255));
  }
  strip.show();
  delay(100);  
}




void loop() {  
  // clear all pixels
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0, 0, 0);
  }
  //draw last ball position to make a trails effect
  ZigZagPixel(ball[0],ball[1],50, 0, 50);
  
  //move ball
  ball[0] += ballVelocity[0];
  ball[1] += ballVelocity[1];

  // bounce ball
  if (ball[0] < 1) {
    ball[0] = 0;
    ball[1] += 1 - random(2);
    ballVelocity[0] = abs(ballVelocity[0]);
  } else if (ball[0] > 15) {
    ball[0] = 15;
    ball[1] += 1 - random(2);
    ballVelocity[0] = -ballVelocity[0];
  }
  if (ball[1] < 1) {
    ball[1] = 0;
    ball[0] += 1 - random(2);
    ballVelocity[1] = abs(ballVelocity[1]);
  } else if (ball[1] > 15) {
    ball[1] = 15;
    ball[0] += 1 - random(2);
    ballVelocity[1] = -ballVelocity[1];
  }

  // draw ball deal with zigzag
  ZigZagPixel(ball[0],ball[1],255, 0, 255);

  //draw color 
  for (int i = 0; i < 6; i++) {
    ZigZagPixel(i+constrain(distance-5, 0, 10),0,255,255,255);
  }
  
  // Clears the trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  // Calculating the distance
  distance= duration*0.034/2;
  // Prints the distance on the Serial Monitor
  Serial.print("Distance: ");
  Serial.println(distance);
  Serial.println(distance);
  
  strip.show();
  delay(WAIT);
}


void ZigZagPixel(int x,int y,int r,int g,int b)
{
  if (y % 2){
    strip.setPixelColor(y * 16 + x, r, g,  b);
  }else{
    strip.setPixelColor(y * 16 + 15-x, r, g,  b);
  }
}
