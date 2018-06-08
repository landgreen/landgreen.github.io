#include <Adafruit_NeoPixel.h>

const int WAIT = 100; //WAIT is used x4 times per cycle
const int LEDPIN = 6;         // pin for LEDS
const int SWITCH_PIN_1 = 2;         // pin for P1 switch
const int SWITCH_PIN_2 = 4;         // pin for P2 switch
const int NUM_LEDS = 256;    // 16x16 = 256
const int BRIGHTNESS = 5;   // 0-100 LED brightness

//player 1 is cyan
//player 2 is pink

int p1[2] = { -1, 8}; //player location
int p2[2] = {16, 8}; //player location
int p1Input[2] = {1, 0};
int p2Input[2] = { -1, 0};
int p1Velocity[2] = {1, 0};
int p2Velocity[2] = { -1, 0};
bool isP1Move = true;
bool isP2Move = true;

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
  //basic move loop
  P1Move();
  P2Move();
  playerCollisions();
  updateGameState();
  drawPlayers();
  strip.show();
  delay(WAIT);

  //optional boost move loop
  for (int i = 0; i < 4; i++) {
    if (!digitalRead(SWITCH_PIN_1)){
      P1Move();
    }
    if (!digitalRead(SWITCH_PIN_2)){
      P2Move();
    }
    playerCollisions();
    updateGameState();
    drawPlayers();
    strip.show();
    delay(WAIT);
  }
}
void updateGameState(){
  on[p1[0]][p1[1]] = true;
  on[p2[0]][p2[1]] = true;
}

void P1Move()
{
  //flags for a collision check
  isP1Move = true;
  //get input from game controllers
  p1Input[0] = -map(analogRead(0), 0, 1023, -3, 4);
  p1Input[1] = -map(analogRead(1), 0, 1023, -3, 4);

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

  //move player 1
  p1[0] += p1Velocity[0];
  p1[1] += p1Velocity[1];
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
}

void P2Move()
{
  //flags for a collision check
  isP2Move = true; 
  
  //get input from game controllers
  p2Input[0] = map(analogRead(2), 0, 1023, -3, 4);
  p2Input[1] = map(analogRead(3), 0, 1023, -3, 4);

  // change player velocity from inputs
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

  //move player 2
  p2[0] += p2Velocity[0];
  p2[1] += p2Velocity[1];
  //edge around the world
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
}

void playerCollisions(){
  //check for player + player tip collision
  if (p1[0] == p2[0] && p1[1] == p2[1]) {
    tie(); 
  } 
  //check for player1 + wall collision
  if (isP1Move && on[p1[0]][p1[1]]) { 
    p2Wins(); 
  }
  //check for player2 + wall collision
  if (isP2Move && on[p2[0]][p2[1]]) {
    p1Wins(); 
  }
  //reset player moved to false
  isP1Move = false;
  isP2Move = false;
}




void p1Wins()
{
  if (isP1Move && on[p1[0]][p1[1]]) {
    tie();
  }
  Serial.println("p1/cyan wins!");
  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(0, 15, 15);
  ZigZagPixel(p2[0], p2[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void p2Wins()
{
  if (isP2Move && on[p2[0]][p2[1]]) {
    tie();
  }
  Serial.println("p2/pink, wins!");
  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(15, 0, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void tie()
{
  Serial.println("tie game");
  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(15, 15, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  while (1) {} //end game
}

void drawPlayers(){
  //draw players
  ZigZagPixel(p1[0], p1[1], 0, 255, 255);
  ZigZagPixel(p2[0], p2[1], 255, 0, 255);
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




//#include <Adafruit_NeoPixel.h>
//
//const int WAIT = 200; //WAIT is used 3 times per cycle
//const int LEDPIN = 6;         // pin for LEDS
//const int SWITCH_PIN_1 = 2;         // pin for P1 switch
//const int SWITCH_PIN_2 = 4;         // pin for P2 switch
//const int NUM_LEDS = 256;    // 16x16 = 256
//const int BRIGHTNESS = 20;   // 0-100 LED brightness
//
////player 1 is cyan
////player 2 is pink
//
//int p1[2] = { -1, 8}; //player location
//int p2[2] = {16, 8}; //player location
//int p1Input[2] = {1, 0};
//int p2Input[2] = { -1, 0};
//int p1Velocity[2] = {1, 0};
//int p2Velocity[2] = { -1, 0}; 
////locations where the players have been
//bool on[16][16] = {
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
//};
//
//
//// Parameter 1 = number of pixels in strip
//// Parameter 2 = pin number (most are valid)
//// Parameter 3 = pixel type flags, add together as needed:
////   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
////   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
////   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
////   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LEDPIN, NEO_GRB + NEO_KHZ800);
//
//
//void setup() {
//  Serial.begin(9600);
//  //activate pull-up resistor on the push-button pin
//  pinMode(SWITCH_PIN_1, INPUT_PULLUP);
//  pinMode(SWITCH_PIN_2, INPUT_PULLUP);
//  
//  strip.setBrightness(BRIGHTNESS);
//  strip.begin();
//  for (int i = 0; i < NUM_LEDS; i += 2) {
//    strip.setPixelColor(i, 200, 0, 200);
//    strip.setPixelColor(i + 1, 200, 0, 200);
//    strip.setPixelColor(NUM_LEDS - i, 0, 200, 200);
//    strip.setPixelColor(NUM_LEDS - i - 1, 0, 200, 200);
//    strip.show();
//  }
//  delay(200);
//  // clear all pixels
//  for (int i = 0; i < NUM_LEDS; i++) {
//    strip.setPixelColor(i, 0, 0, 0);
//  }
//  strip.show();
//}
//
//
//void loop() {
//  playerMoveInputs();
//  P1Move();
//  P2Move();
//  playerCollisions(true, true);
//  drawPlayers();
//  strip.show();
//  delay(WAIT);
//
//  boost();
//  strip.show();
//  delay(WAIT);
//
//  boost();
//  strip.show();
//  delay(WAIT);
//}
//void updateGameState(){
//  on[p1[0]][p1[1]] = true;
//  on[p2[0]][p2[1]] = true;
//}
//
//
//void boost(){  
//  if (!digitalRead(SWITCH_PIN_1)){
//    playerMoveInputs();
//    P1Move();
//    playerCollisions(true, false);
//    drawPlayers();
//  }
//  if (!digitalRead(SWITCH_PIN_2)){
//    playerMoveInputs();
//    P2Move();
//    playerCollisions(false, true);
//    drawPlayers();
//  }
//
//}
//
//
//void playerMoveInputs(){
//  //get input from game controllers
//  p1Input[0] = -map(analogRead(0), 0, 1023, -3, 4);
//  p1Input[1] = -map(analogRead(1), 0, 1023, -3, 4);
//  p2Input[0] = map(analogRead(2), 0, 1023, -3, 4);
//  p2Input[1] = map(analogRead(3), 0, 1023, -3, 4);
//
//  // change player velocity from inputs
//  // don't let player go backwards and die
//  if (p1Input[0] > 1 && p1Velocity[0] != -1) {
//    p1Velocity[0] = 1;
//    p1Velocity[1] = 0;
//  } else if (p1Input[0] < -1 && p1Velocity[0] != 1) {
//    p1Velocity[0] = -1;
//    p1Velocity[1] = 0;
//  } else if (p1Input[1] > 1 && p1Velocity[1] != -1) {
//    p1Velocity[1] = 1;
//    p1Velocity[0] = 0;
//  } else if (p1Input[1] < -1 && p1Velocity[1] != 1) {
//    p1Velocity[1] = -1;
//    p1Velocity[0] = 0;
//  }
//  //P2
//  if (p2Input[0] > 1 && p2Velocity[0] != -1) {
//    p2Velocity[0] = 1;
//    p2Velocity[1] = 0;
//  } else if (p2Input[0] < -1  && p2Velocity[0] != 1) {
//    p2Velocity[0] = -1;
//    p2Velocity[1] = 0;
//  } else if (p2Input[1] > 1  && p2Velocity[1] != -1) {
//    p2Velocity[1] = 1;
//    p2Velocity[0] = 0;
//  } else if (p2Input[1] < -1  && p2Velocity[1] != 1) {
//    p2Velocity[1] = -1;
//    p2Velocity[0] = 0;
//  }
//}
//
//
//
//void P1Move()
//{
//  //move player 1
//  p1[0] += p1Velocity[0];
//  p1[1] += p1Velocity[1];
//  //edge around the world
//  if (p1[0] < 0) {
//    p1[0] = 15;
//  } else if (p1[0] > 15) {
//    p1[0] = 0;
//  }
//  if (p1[1] < 0) {
//    p1[1] = 15;
//  } else if (p1[1] > 15) {
//    p1[1] = 0;
//  }
//}
//
//void P2Move()
//{
//  //move player 2
//  p2[0] += p2Velocity[0];
//  p2[1] += p2Velocity[1];
//  //edge around the world
//  if (p2[0] < 0) {
//    p2[0] = 15;
//  } else if (p2[0] > 15) {
//    p2[0] = 0;
//  }
//  if (p2[1] < 0) {
//    p2[1] = 15;
//  } else if (p2[1] > 15) {
//    p2[1] = 0;
//  }
//}
//
//void playerCollisions(bool checkP1, bool checkP2){
//  if (p1[0] == p2[0] && p1[1] == p2[1]) {
//    tie(); //check for player+player tip collision
//  } else if (checkP1 && on[p1[0]][p1[1]]) { 
//    p2Wins(); //check for player1 +wall collision
//  } else if (checkP2 && on[p2[0]][p2[1]]) {
//    p1Wins(); //check for player2+wall collision
//  }
//  updateGameState();
//}
//
//
//
//
//void p1Wins()
//{
//  if (on[p1[0]][p1[1]]) {
//    tie();
//  }
//  Serial.println("p1/cyan wins!");
//  GameStateDump();
//  FillEmpty(0, 15, 15);
//  ZigZagPixel(p2[0], p2[1], 255, 0, 0);
//  strip.show();
//  while (1) {} //end game
//}
//
//void p2Wins()
//{
//  if (on[p2[0]][p2[1]]) {
//    tie();
//  }
//  Serial.println("p2/pink, wins!");
//  GameStateDump();
//  FillEmpty(15, 0, 15);
//  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
//  strip.show();
//  while (1) {} //end game
//}
//
//void tie()
//{
//  Serial.println("tie game");
//  GameStateDump();
//  FillEmpty(15, 15, 15);
//  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
//  strip.show();
//  while (1) {} //end game
//}
//
//void drawPlayers(){
//  //draw players
//  ZigZagPixel(p1[0], p1[1], 0, 255, 255);
//  ZigZagPixel(p2[0], p2[1], 255, 0, 255);
//}
//
//void ZigZagPixel(int x, int y, int r, int g, int b)
//{
//  if (y % 2) {
//    strip.setPixelColor(y * 16 + x, r, g,  b);
//  } else {
//    strip.setPixelColor(y * 16 + 15 - x, r, g,  b);
//  }
//}
//
//void getZigZagPixel(int x, int y)
//{
//  if (y % 2) {
//    Serial.println(strip.getPixelColor(y * 16 + x) );
//  } else {
//    Serial.println(strip.getPixelColor(y * 16 + 15 - x));
//  }
//}
//
//
//void GameStateDump() {
//  for (int i = 0; i < 16; i++) {
//    for (int j = 0; j < 16; j++)
//    {
//      Serial.print(on[j][i]);
//      Serial.print(",");
//    }
//    Serial.println();
//  }
//  Serial.print("p1 = ");
//  Serial.print(p1[0]);
//  Serial.print(", ");
//  Serial.print(p1[1]);
//  Serial.println();
//  Serial.print("p2 = ");
//  Serial.print(p2[0]);
//  Serial.print(", ");
//  Serial.print(p2[1]);
//  Serial.println();
//  Serial.print("p1 Velocity = ");
//  Serial.print(p1Velocity[0]);
//  Serial.print(", ");
//  Serial.print(p1Velocity[1]);
//  Serial.println();
//  Serial.print("p2 Velocity = ");
//  Serial.print(p2Velocity[0]);
//  Serial.print(",");
//  Serial.print(p2Velocity[1]);
//  Serial.println();
//  Serial.println();
//}
//
//void FillEmpty(int r, int g, int b) {
//  for (int i = 0; i < 16; i++) {
//    for (int j = 0; j < 16; j++)
//    {
//      if (!on[i][j]) {
//        ZigZagPixel(i, j, r, g, b);
//      }
//    }
//  }
//}
//

