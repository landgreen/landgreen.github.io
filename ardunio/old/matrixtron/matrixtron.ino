#include <Adafruit_NeoPixel.h>

const int WAIT = 1000;
const int LEDPIN = 6;         // pin for LEDS
const int SWITCH_PIN_1 = 2;         // pin for P1 switch
const int SWITCH_PIN_2 = 4;         // pin for P2 switch
const int NUM_LEDS = 256;    // 16x16 = 256
const int BRIGHTNESS = 20;   // 0-100 LED brightness

//player 1 is cyan
//player 2 is pink

int p1[2] = { -1, 8}; //player location
int p2[2] = {16, 8}; //player location
int p1Input[2] = {1, 0};
int p2Input[2] = { -1, 0};
int p1Velocity[2] = {1, 0};
int p2Velocity[2] = { -1, 0}; 
//locations where the players have been
bool on[16][16] = {
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
};


// Parameter 1 = number of pixels in strip
// Parameter 2 = pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LEDPIN, NEO_GRB + NEO_KHZ800);


void setup() {
  Serial.begin(9600);
  //activate pull-up resistor on the push-button pin
  pinMode(SWITCH_PIN_1, INPUT_PULLUP);
  pinMode(SWITCH_PIN_2, INPUT_PULLUP);
  
  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  for (int i = 0; i < NUM_LEDS; i += 2) {
    strip.setPixelColor(i, 200, 0, 200);
    strip.setPixelColor(i + 1, 200, 0, 200);
    strip.setPixelColor(NUM_LEDS - i, 0, 200, 200);
    strip.setPixelColor(NUM_LEDS - i - 1, 0, 200, 200);
    strip.show();
  }
  delay(200);
  // clear all pixels
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0, 0, 0);
  }
  strip.show();
}


void loop() {
  //get input from game controllers
  p1Input[0] = -map(analogRead(0), 0, 1023, -3, 4);
  p1Input[1] = -map(analogRead(1), 0, 1023, -3, 4);
  p2Input[0] = map(analogRead(2), 0, 1023, -3, 4);
  p2Input[1] = map(analogRead(3), 0, 1023, -3, 4);

  // change player velocity from inputs
  // don't let player go backwards and die
  if (p1Input[0] > 1 && p1Velocity[0] != -1) {
    p1Velocity[0] = 1;
    p1Velocity[1] = 0;
  } else if (p1Input[0] < -1 && p1Velocity[0] != 1) {
    p1Velocity[0] = -1;
    p1Velocity[1] = 0;
  } else if (p1Input[1] > 1 && p1Velocity[1] != -1) {
    p1Velocity[1] = 1;
    p1Velocity[0] = 0;
  } else if (p1Input[1] < -1 && p1Velocity[1] != 1) {
    p1Velocity[1] = -1;
    p1Velocity[0] = 0;
  }

  if (p2Input[0] > 1 && p2Velocity[0] != -1) {
    p2Velocity[0] = 1;
    p2Velocity[1] = 0;
  } else if (p2Input[0] < -1  && p2Velocity[0] != 1) {
    p2Velocity[0] = -1;
    p2Velocity[1] = 0;
  } else if (p2Input[1] > 1  && p2Velocity[1] != -1) {
    p2Velocity[1] = 1;
    p2Velocity[0] = 0;
  } else if (p2Input[1] < -1  && p2Velocity[1] != 1) {
    p2Velocity[1] = -1;
    p2Velocity[0] = 0;
  }

  //move player 1
  p1[0] += p1Velocity[0];
  p1[1] += p1Velocity[1];
    //move player 2
  p2[0] += p2Velocity[0];
  p2[1] += p2Velocity[1];
  //button boost
  if (!digitalRead(SWITCH_PIN_1)){
    p1[0] += p1Velocity[0];
    p1[1] += p1Velocity[1];
  }
  //button boost
  if (!digitalRead(SWITCH_PIN_2)){
    p2[0] += p2Velocity[0];
    p2[1] += p2Velocity[1];
  }

  
  //wall collision death
  //    if (p1[0]< 0 || p1[0]>15 || p1[1]<0 || p1[1]>15){
  //      p2Wins();
  //    } else if (p2[0]< 0 || p2[0]>15 || p2[1]<0 || p2[1]>15){
  //      p1Wins();
  //    }

  //edge around the world
  if (p1[0] < 0) {
    p1[0] = 15;
  } else if (p1[0] > 15) {
    p1[0] = 0;
  }
  if (p1[1] < 0) {
    p1[1] = 15;
  } else if (p1[1] > 15) {
    p1[1] = 0;
  }

  if (p2[0] < 0) {
    p2[0] = 15;
  } else if (p2[0] > 15) {
    p2[0] = 0;
  }
  if (p2[1] < 0) {
    p2[1] = 15;
  } else if (p2[1] > 15) {
    p2[1] = 0;
  }

  //check for player+player tip collision
  if (p1[0] == p2[0] && p1[1] == p2[1]) {
    tie();
  }
  
  //check for player+wall collision
  if (on[p1[0]][p1[1]]) { 
    p2Wins();
  } else if (on[p2[0]][p2[1]]) {
    p1Wins();
  } else {
    //draw players
    on[p1[0]][p1[1]] = true;
    ZigZagPixel(p1[0], p1[1], 0, 255, 255);
    on[p2[0]][p2[1]] = true;
    ZigZagPixel(p2[0], p2[1], 255, 0, 255);
  }

  strip.show();
  delay(WAIT);
}


void p1Wins()
{
  if (on[p1[0]][p1[1]]) {
    tie();
  }
  Serial.println("p1/cyan wins!");
  GameStateDump();
  FillEmpty(0, 15, 15);
  ZigZagPixel(p2[0], p2[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void p2Wins()
{
  if (on[p2[0]][p2[1]]) {
    tie();
  }
  Serial.println("p2/pink, wins!");
  GameStateDump();
  FillEmpty(15, 0, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void tie()
{
  Serial.println("tie game");
  GameStateDump();
  FillEmpty(15, 15, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void ZigZagPixel(int x, int y, int r, int g, int b)
{
  if (y % 2) {
    strip.setPixelColor(y * 16 + x, r, g,  b);
  } else {
    strip.setPixelColor(y * 16 + 15 - x, r, g,  b);
  }
}

void getZigZagPixel(int x, int y)
{
  if (y % 2) {
    Serial.println(strip.getPixelColor(y * 16 + x) );
  } else {
    Serial.println(strip.getPixelColor(y * 16 + 15 - x));
  }
}


void GameStateDump() {
  for (int i = 0; i < 16; i++) {
    for (int j = 0; j < 16; j++)
    {
      Serial.print(on[j][i]);
      Serial.print(",");
    }
    Serial.println();
  }
  Serial.print("p1 = ");
  Serial.print(p1[0]);
  Serial.print(", ");
  Serial.print(p1[1]);
  Serial.println();
  Serial.print("p2 = ");
  Serial.print(p2[0]);
  Serial.print(", ");
  Serial.print(p2[1]);
  Serial.println();
  Serial.print("p1 Velocity = ");
  Serial.print(p1Velocity[0]);
  Serial.print(", ");
  Serial.print(p1Velocity[1]);
  Serial.println();
  Serial.print("p2 Velocity = ");
  Serial.print(p2Velocity[0]);
  Serial.print(",");
  Serial.print(p2Velocity[1]);
  Serial.println();
  Serial.println();
}

void FillEmpty(int r, int g, int b) {
  for (int i = 0; i < 16; i++) {
    for (int j = 0; j < 16; j++)
    {
      if (!on[i][j]) {
        ZigZagPixel(i, j, r, g, b);
      }
    }
  }
}


