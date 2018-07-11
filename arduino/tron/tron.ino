#include <Adafruit_NeoPixel.h>

const int WAIT = 250;         // how many cycles to look for player joystick input
const int LEDPIN = 6;         // pin for LEDS
const int SWITCH_PIN_1 = 2;   // pin for P1 switch
const int SWITCH_PIN_2 = 4;   // pin for P2 switch
const int NUM_LEDS = 256;     // 16x16 = 256
const int BRIGHTNESS = 30;     // 0-100 LED brightness

//player 1 is cyan
//player 2 is pink

int p1[2] = {8, -1};  //player location
int p2[2] = {8, 16};   //player location
int p1Input[2] = {0, 0};
int p2Input[2] = { 0, 0};
int p1Velocity[2] = {0, -1};
int p2Velocity[2] = {0, 1};
bool isP1Move = true;
bool isP2Move = true;

// locations where the players have been
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
  for (int i = 0; i < NUM_LEDS; i += 4) {
    for (int j = 0; j < 4; j++) {
      strip.setPixelColor(i + j, 255, 0, 255);
      strip.setPixelColor(NUM_LEDS - i - j, 0, 255, 255);
    }
    strip.show();
  }
  // clear all pixels
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0, 0, 0);
  }
  strip.show();
}

void loop() {
  isP1Move = true;
  isP2Move = true;
  for (int i = 0; i < 4; i++) {
    //player moves extra if button is down
    if (!digitalRead(SWITCH_PIN_1)) {
      isP1Move = true;
        Serial.print(1);
        Serial.println();
    }
    if (!digitalRead(SWITCH_PIN_2)) {
      isP2Move = true;
        Serial.print(2);
        Serial.println();
    }
    if (isP1Move) P1Move();
    if (isP2Move) P2Move();
    playerJoystickInput(); //extra check for player input to smooth control sensing
    playerCollisions();
    updateGameState();
    drawPlayers();

    //check for player input
    for (int i = 0; i < WAIT; i++) {
      playerJoystickInput(); //consider placing playerJoystickInput() in more places in the loop to get more twitch response
    }
  }
}

void updateGameState() {
  on[p1[0]][p1[1]] = true;
  on[p2[0]][p2[1]] = true;
}

void playerJoystickInput() {
  //read input from game controllers
  int p1x = -map(analogRead(0), 0, 1023, -3, 4);
  int p1y = -map(analogRead(1), 0, 1023, -3, 4);
  int p2x =  map(analogRead(2), 0, 1023, -3, 4);
  int p2y =  map(analogRead(3), 0, 1023, -3, 4);

  // log the input if it is not zero
  if (!(p1x == 0 && p1y == 0)) {
    p1Input[0] = p1x;
    p1Input[1] = p1y;
  }
  if (!(p2x == 0 && p2y == 0)) {
    p2Input[0] = p2x;
    p2Input[1] = p2y;
  }
}

void P1Move() {
  // change player velocity from inputs
  // don't let player go backwards and die
  if (p1Input[0] > 0 && p1Velocity[0] != -1) {
    p1Velocity[0] = 1;
    p1Velocity[1] = 0;
  } else if (p1Input[0] < 0 && p1Velocity[0] != 1) {
    p1Velocity[0] = -1;
    p1Velocity[1] = 0;
  } else if (p1Input[1] > 0 && p1Velocity[1] != -1) {
    p1Velocity[1] = 1;
    p1Velocity[0] = 0;
  } else if (p1Input[1] < 0 && p1Velocity[1] != 1) {
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

void P2Move() {
  // change player velocity from inputs
  // don't let player go backwards and die
  if (p2Input[0] > 0 && p2Velocity[0] != -1) {
    p2Velocity[0] = 1;
    p2Velocity[1] = 0;
  } else if (p2Input[0] < 0  && p2Velocity[0] != 1) {
    p2Velocity[0] = -1;
    p2Velocity[1] = 0;
  } else if (p2Input[1] > 0  && p2Velocity[1] != -1) {
    p2Velocity[1] = 1;
    p2Velocity[0] = 0;
  } else if (p2Input[1] < 0  && p2Velocity[1] != 1) {
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

void playerCollisions() {
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

void p1Wins() {
  if (isP1Move && on[p1[0]][p1[1]]) {
    tie();
  }
//  Serial.println("p1/cyan wins!");
//  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(0, 15, 15);
  ZigZagPixel(p2[0], p2[1], 255, 0, 0);
  strip.show();

  endGame();
}

void p2Wins() {
  if (isP2Move && on[p2[0]][p2[1]]) {
    tie();
  }
//  Serial.println("p2/pink, wins!");
//  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(15, 0, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  endGame();
}

void tie() {
//  Serial.println("tie game");
//  GameStateDump();
  strip.setBrightness(20);
  FillEmpty(15, 15, 15);
  ZigZagPixel(p1[0], p1[1], 255, 0, 0);
  strip.show();
  endGame();
}

void drawPlayers() {
  //draw players
  ZigZagPixel(p1[0], p1[1], 0, 255, 255);
  ZigZagPixel(p2[0], p2[1], 255, 0, 255);
  strip.show();
}

void ZigZagPixel(int x, int y, int r, int g, int b) {
  if (y % 2) {
    strip.setPixelColor(y * 16 + x, r, g,  b);
  } else {
    strip.setPixelColor(y * 16 + 15 - x, r, g,  b);
  }
}

void getZigZagPixel(int x, int y) {
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




void(* resetFunc) (void) = 0; //declare reset function @ address 0
void endGame() {
  delay(5000);
  resetFunc();  //call reset
}

