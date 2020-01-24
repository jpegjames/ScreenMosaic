// ================
// Config
// ================
var port          = 1234;



// ================
// Setup Server
// ================

var express       = require('express')
var app           = express();
var http          = require('http').Server(app);
var io            = require('socket.io')(http, {
    pingInterval: 5000,
    pingTimeout: 5000
});
var Cookies       = require('cookies');
var randomstring  = require("randomstring");

// gallery install specific
var lastColorChange = 0;        // stores milliseconds of last time color changed
var colorChangeInterval = 2000; // milliseconds
var frozenColor;                // locked color when user walks in front of Kinect
var bkgColorH = 0;
var bkgColorS = 90;
var bkgColorL = 51;
var bkgColorHInterval = 5;

http.listen(port, function(){
  console.log('listening on *:' + port);
});


// set the view engine to ejs (I'm a Ruby guy)
app.set('view engine', 'ejs');


// setup static path (`resources` has priority)
app.use(express.static('resources'));
app.use(express.static('public'));



// ================
// Views
// ================


// Default:
// Renders view for device within the screen array
app.get('/', function(req, res) {
  // var config = require("config/screens.json");
  // console.log(config);

  // var fs = require("fs");
  // var contents = fs.readFileSync("config/screens.json");
  // var jsonContent = JSON.parse(contents);
  //
  // console.log("Output Content : \n"+ jsonContent[0]);
  //



  // Create a cookies object
  var cookies = new Cookies(req, res);

  // Cookies
  // step 1: check for cookie
  // step 2a: load cookie
  // step 2b: generate token; set cookie
  var screenToken = cookies.get('screenToken');

  if (screenToken === undefined) {
    screenToken = randomstring.generate(7);;
    cookies.set('screenToken', screenToken, {expires: new Date('2050-12-31')});
  }


  // load screenData
  screensJSON = loadScreens();

  const screenData = screensJSON.filter((s) => {
    if (req.query.id) {
      return s.id == req.query.id
    } else {
      return s.token == screenToken
    }
  })[0];

  if (req.query.id) {
    screenToken = screenData["token"];
  }

  if (screenData && screenData["viewport"] !== undefined) {
    viewport = screenData["viewport"];
  } else if (screenData && screenData["width"] !== undefined) {
    viewport = "width=" + screenData["width"];
  } else {
    viewport = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0";
  }

  console.log(req.query.id);
  console.log(screenData);

  res.render('screen', {screenData: screenData, screenToken: screenToken, viewport: viewport});
});

// possibly temp
//
app.get('/preview', function(req, res) {
  res.render('preview');
});

// Controller:
// Can be used to send commands to change the default view
// NOTE: This should possibly be an API endpoint or nothing at all
//       the controller view is specific to the project and shouldn't
//       be a part of the repo
app.get('/controller', function(req, res) {
  //var socket = io();
  // var img = "https://images.unsplash.com/photo-1533756201498-1b4b1ff675e6?ixlib=rb-0.3.5&s=f3734bb538050f55bf576a28683eaa6b&auto=format&fit=crop&w=2468&q=80";
  // io.socket.emit('screen image', img);

  res.render('controller');
})

// Setup:
// Used to setup device positions, resolution, etc
app.get('/setup', function(req, res) {
  screensJSON = loadScreens();

  res.render('setup', {screensJSON: screensJSON});
})



// ================
// Shared Functions
// (not DRY, also in resize.js file)
// ================

function loadScreens() {
  var fs = require("fs");
  var screens = fs.readFileSync("config/screens.json");
  var screensJSON = JSON.parse(screens);

  return screensJSON;
}


// ================
// Gallery specific functions
// ================
//
//
// 1 - If no depth data, cycle colors ever colorChangeInterval
// 2 - if depth data, lock color, update depth data as provided by Processing
//



function changeColor(hitData) {
  // if (Date.now() > lastColorChange + colorChangeInterval) {
  //   var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
  //   io.emit('screen color', {'color': randomColor, 'hitData': hitData});
  //   lastColorChange = Date.now();
  //
  //   // console.log('change color');
  //   // console.log(randomColor);
  // }
  //
  //
  //

  var screenColors = {};

  if (!hasAnyDepth(hitData['data'])) {
    cycleHue(hitData['data']);
    io.emit('screen color', 'hsl(' + bkgColorH + ', ' + bkgColorS + '%, ' + bkgColorL +'%)');
  } else {

    // this reloads multiple times a second and is not efficient to include here
    var screensJSON = loadScreens();
    var depthMultiplier = 13; // specific to gallery specific setup

    // console.log('--------------');


    Object.keys(screensJSON).forEach(function(key) {
      var screen = screensJSON[key];
      var screenTop = screen['top'];
      var screenLeft = screen['left'];
      var screenHeight = screen['height'];
      var screenWidth = screen['width'];

      screenColors[screen['token']] = '#000000';

      for(hindex = 0; hindex < hitData['data'].length; hindex++) {
        var hitPoint = hitData['data'][hindex]; // [x,y,z]

        // console.log('-----');
        // console.log(hitData);
        // console.log(hitPoint);
        // console.log('-----');

        if (
          hitPoint[2] > 0 &&
          hitPoint[0] * depthMultiplier > screenLeft &&
          hitPoint[0] * depthMultiplier < screenLeft + screenWidth &&
          hitPoint[1] * depthMultiplier > screenTop &&
          hitPoint[1] * depthMultiplier < screenTop + screenHeight
        ) {

          // console.log('hit detected');
          // console.log(key)
          // console.log(screen);
          // console.log(hitPoint);
          // console.log(hitPoint[0] * depthMultiplier);
          // console.log(hitPoint[1] * depthMultiplier);
          //
          // console.log(screenLeft);
          // console.log(screenWidth);
          // console.log(screenTop);
          // console.log(screenHeight);

          // 6240
          // 4680
          //
          // 5125
          // 1150
          // 4010
          // 860

          screenColors[screen['token']] = 'hsl(' + bkgColorH + ', ' + bkgColorS + '%, ' + bkgColorL * hitPoint[2] +'%)';
        }

      }
    });



    io.emit('screen color', screenColors);
  }

}

function cycleHue(hitData) {
  // if (!hasAnyDepth(hitData)) {
  //   bkgColorH += bkgColorHInterval;
  //   bkgColorL = 51;
  // } else {
  //   bkgColorL = 80;
  // }

  bkgColorH += bkgColorHInterval;
  if (bkgColorH > 360) {
    bkgColorH = bkgColorH - 360;
  }
}

function hasAnyDepth(hitData) {
  // console.log(hitData)
  for(index = 0; index < hitData.length; index++) {
    if (hitData[index][2] > 0) {
      // console.log('hit')
      return true;
    }
  }
  return false;
}

/**
* https://stackoverflow.com/a/36722579/126250
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   {number}  h       The hue
* @param   {number}  s       The saturation
* @param   {number}  l       The lightness
* @return  {Array}           The RGB representation
*/
function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// https://stackoverflow.com/a/44134328/126250
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ================
// Socket Logic
// ================

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  // processing testing
  socket.on('message', function(msg) {
    console.log(msg);
  });
  socket.on('kinect', function(data) {
    // console.log(data);
    changeColor(data);
  });

  //  TODO: Standardize API for content on screen
  //
  socket.on('screen grid', function(msg){
    console.log('grid: ' + msg);
    io.emit('screen grid', msg);
  });

  socket.on('screen image', function(msg){
    console.log('image: ' + msg);
    io.emit('screen image', msg);
  });

  socket.on('screen color', function(msg){
    console.log('color: ' + msg);
    io.emit('screen color', msg);
  });

  socket.on('screen audio', function(msg){
    console.log('audio: ' + msg);
    io.emit('screen audio', msg);
  });

  socket.on('screen video', function(msg){
    console.log('video: ' + msg);
    io.emit('screen video', msg);
  });

  socket.on('screen iframe', function(msg){
    console.log('iframe: ' + msg);
    io.emit('screen iframe', msg);
  });

  // TODO: canvas

  socket.on('screen instruction', function(msg){
    console.log('instruction: ' + msg);
    io.emit('screen instruction', msg);
  });
});
