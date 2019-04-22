// ====================
// Usage
// ====================
// run from bash:
// node.js resize.js [image_path]



// ====================
// Loop through screens
// ====================

// load screenData
var image = process.argv.slice(2)[0],
    screensJSON = loadScreens();


console.log('Processing ' + image + '. Please wait...')


// loop
Object.keys(screensJSON).forEach(function(key) {
  var screen = screensJSON[key];
  cropForScreen('public/images/' + image, screen);
});



// ====================
// Functions
// (not DRY, loadScreens in resize.js file)
// ====================


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

function loadScreens() {
  var fs = require("fs");
  var screens = fs.readFileSync("config/screens.json");
  var screensJSON = JSON.parse(screens);

  return screensJSON;
}
