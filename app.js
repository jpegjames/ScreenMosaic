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


  // ---------------------

app.get('/resize', function(req, res) {
  var fs = require('fs')
  , gm = require('gm');

  console.log("begin resize test")


  // gm('public/images/test/photo1.jpeg')
  // .crop(600,1024,0,0)
  // .noProfile()
  // .write('public/images/test/photo1-cropped-resized.jpg', function (err) {
  //   if (!err) {
  //     console.log("resized test successful");
  //     res.send("<h1>resized test successful!</h1>")
  //   } else {
  //     res.send(err)
  //   }
  //
  // });


  screensJSON = loadScreens();

  Object.keys(screensJSON).forEach(function(key) {
    var screen = screensJSON[key];


    cropForScreen('public/images/' + req.query.image, screen);
    // cropForScreen('public/images/hunter/hunter3.jpg', screen);
    // cropForScreen('public/images/hunter/hunter3.jpg', screen);
    // cropForScreen('public/images/hunter/hunter4.jpg', screen);
    // cropForScreen('public/images/hunter/hunter5.jpg', screen);
    // cropForScreen('public/images/hunter/hunter6.jpg', screen);
    // cropForScreen('public/images/hunter/hunter7.jpg', screen);
    // cropForScreen('public/images/hunter/hunter8.jpg', screen);

  });

  res.send("<h1>Done!</h1>");

})

function cropForScreen(image_path, screen) {
  var fs = require('fs')
  , gm = require('gm')
  , quality = 30
  , re = /(?:\.([^.]+))?$/;

  // console.log(screen["id"], screen["width"], screen["height"], screen["left"], screen["top"]);

  var ext = re.exec(image_path)[0];
  var new_image_path = image_path.replace(ext, '') + "-" + screen["id"] + ext;

  gm(image_path)
  .crop(screen["width"], screen["height"], screen["left"], screen["top"])
  .noProfile()
  .quality(quality)
  .write(new_image_path, function(err) {
    if (err) {
      console.log("Error on screen " + screen["id"] + ":")
      console.log(err)
    } else {
      console.log("Cropped image for screen " + screen["id"] + "!")
    }
  })
}



  // ---------------------




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
// ================

function loadScreens() {
  var fs = require("fs");
  var screens = fs.readFileSync("config/screens.json");
  var screensJSON = JSON.parse(screens);

  return screensJSON;
}



// ================
// Socket Logic
// ================

io.on('connection', function(socket){
  // console.log('a user connected');
  socket.on('disconnect', function(){
    // console.log('user disconnected');
  });

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

  // TODO: canvas

  socket.on('screen instruction', function(msg){
    console.log('instruction: ' + msg);
    io.emit('screen instruction', msg);
  });
});
