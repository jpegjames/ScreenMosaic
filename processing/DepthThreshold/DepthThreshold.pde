// Daniel Shiffman
// Depth thresholding example

// https://github.com/shiffman/OpenKinect-for-Processing
// http://shiffman.net/p5/kinect/

// Original example by Elie Zananiri
// http://www.silentlycrashing.net

import org.openkinect.freenect.*;
import org.openkinect.processing.*;
import websockets.*;

WebsocketClient wsc;

Kinect kinect;

// Depth image
PImage depthImg;

// Which pixels do we care about?
int minDepth =  60;
int maxDepth = 960;

// What is the kinect's angle
float angle;

// Point detection
// How many points
int xpoints = 10;
int ypoints = 10;

ArrayList<PVector> hitpoints = new ArrayList<PVector>();
ArrayList<PVector> prevHitpoints = new ArrayList<PVector>();

// Camera mode
// press 'c' to change
// 0 - depth threshold
// 1 - depth color
// 2 - video
// 3 - IR
// 4 - black
int cameraMode = 2;

// Setup
//
void setup() {
  size(640, 480);
  frameRate(10);
  
  kinect = new Kinect(this);
  kinect.initDepth();
  kinect.initVideo();
  angle = kinect.getTilt();
  
  kinect.enableColorDepth(true);
  kinect.enableMirror(true);
  
  wsc = new WebsocketClient(this, "ws://localhost:1234/socket.io/?EIO=3&transport=websocket");



  setupHitpoints();
  //println(hitpoints);

  // Blank image
  depthImg = new PImage(kinect.width, kinect.height);
}

void draw() {
  

  // Threshold the depth image
  int[] rawDepth = kinect.getRawDepth();
  
  // loop through hittest pixels
  for (int i=0; i < hitpoints.size(); i++) {
    PVector hitpoint = hitpoints.get(i);
    
    // check Kinect depth
    int hitpointPixelNumber = int(hitpoint.y) * kinect.width + int(hitpoint.x); // -1 (???)
    if (rawDepth[hitpointPixelNumber] >= minDepth && rawDepth[hitpointPixelNumber] <= maxDepth) {
      //hitpoint.z = (rawDepth[hitpointPixelNumber] - minDepth) / maxDepth; // range: 0..1
      //println((rawDepth[hitpointPixelNumber] - minDepth) / maxDepth);
      hitpoint.z = 1;
    } else {
      hitpoint.z = 0;
    }
    
    // check mouse over (for testing)
    if (mouseX > hitpoint.x - 4 && mouseX < hitpoint.x + 4 && mouseY > hitpoint.y - 4 && mouseY < hitpoint.y + 4) {
      hitpoint.z = 1;
    }
    
  }
  
  

  // build threshold depth image if cameramode == 0
  if (cameraMode == 0) {
    for (int i=0; i < rawDepth.length; i++) {
      if (rawDepth[i] >= minDepth && rawDepth[i] <= maxDepth) {
        depthImg.pixels[i] = color(255);
      } else {
        depthImg.pixels[i] = color(0);
      }
    }
  }
  
  
  // which video source to draw
  switch(cameraMode) {
    case 0:
      depthImg.updatePixels();
      image(depthImg, 0, 0);
      break;
    case 1:
      image(kinect.getDepthImage(), 0, 0);
      break;
    case 2: 
      image(kinect.getVideoImage(), 0, 0);
      break;
    case 3:
      image(kinect.getVideoImage(), 0, 0);
      break;
    default:
      background(0);
      break;
  }
  
  
  
  // Draw the raw image
  
 
  
  // send thresholdPixels to node
  //println(thresholdPixels);

  // Draw the thresholded image
  //depthImg.updatePixels();
  //image(depthImg, kinect.width, 0);
  
  
  // concept: draw point detection
  //if (hitTest) {
  //  fill(255,0,0);
  //  circle(p.x + kinect.width, p.y, d);
  //} else {
  //  fill(100);
  //  circle(p.x + kinect.width, p.y, d / 2);
  //}
  
  int previewDiameter = 4;
  for (int i = 0; i < hitpoints.size(); i++) {
    PVector p = hitpoints.get(i);
    if (p.z == 0) {
      fill(0,255,0);
      circle(p.x, p.y, previewDiameter);
    } else {
      fill(255,0,0);
      circle(p.x, p.y, previewDiameter * 3);
    }
  }
  
  //if (!hitpoints.equals(prevHitpoints)) {
  // print("changed "); 
  // // send socket data
  //} else {
  //  // do nothing?
  //}
  
  // socket testing
  wsc.sendMessage("42[\"kinect\",{\"data\":" + hitpoints + "}]");

  
  prevHitpoints = hitpoints;

  fill(0);
  text("TILT: " + angle, 10, 20);
  text("THRESHOLD: [" + minDepth + ", " + maxDepth + "]", 10, 36);
  text("FRAMERATE: " + int(frameRate), 10, 52);
}

// Adjust the angle and the depth threshold min and max
void keyPressed() {
  if (key == CODED) {
    if (keyCode == UP) {
      angle++;
    } else if (keyCode == DOWN) {
      angle--;
    }
    angle = constrain(angle, 0, 30);
    kinect.setTilt(angle);
  } else if (key == 'a') {
    minDepth = constrain(minDepth+10, 0, maxDepth);
  } else if (key == 's') {
    minDepth = constrain(minDepth-10, 0, maxDepth);
  } else if (key == 'z') {
    maxDepth = constrain(maxDepth+10, minDepth, 2047);
  } else if (key == 'x') {
    maxDepth = constrain(maxDepth-10, minDepth, 2047);
  } else if (key == 'c') {
    switchCameraMode();
  }
}

void switchCameraMode() {
  cameraMode++;
  
  if (cameraMode == 3) {
    kinect.enableIR(true); 
  } else {
    kinect.enableIR(false); 
  }
  
  if (cameraMode > 4) {
    cameraMode = 0;
  }
}

// setup hitpoints
void setupHitpoints() {
  int xSpacing = kinect.width / xpoints;
  int xOffset = xSpacing / 2;
  int ySpacing = kinect.height / xpoints;
  int yOffset = ySpacing / 2;
  for (int x = 0; x < xpoints; x++) {
    for (int y = 0; y < ypoints; y++) {
      PVector point = new PVector(xSpacing * x + xOffset, ySpacing * y + yOffset);
      hitpoints.add(point);
    }
  }
}
