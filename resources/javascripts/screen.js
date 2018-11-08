// --- Image functionality
//
// set image
// NOTE 'image' may not be the best as it can also set color and canvas
function setImage(data, screenToken) {
  if (data == null) {
    $('#render img').hide();
  } else if (typeof(data) === 'string') {
    setCroppedImage(data);
  } else {
    setCroppedImage(data["all"]);

    if (data[screenToken] !== undefined) {
      setSingleImage(data[screenToken]);
    }
  }
}

function setCroppedImage(src) {
  var dom = $('#render img');
  dom.attr('src', src);
  dom.removeClass('single');
  dom.show(); // NOTE This should unload the previous or preload the new image before displaying to prevent flashing of old image 
}

function setSingleImage(src) {
  var dom = $('#render img');
  dom.addClass('single');
  dom.attr('src', src);
  dom.show(); // NOTE This should unload the previous or preload the new image before displaying to prevent flashing of old image 
}


function setColor(color) {
  $('#render').css('background-color', color);
}

// --- Audio functionality
//
var audio = new Audio();

function setAudio(data, screenToken) {
  if (data[screenToken] !== undefined) {
    audio.src = data[screenToken];
    audio.play();
  } else {
    // Not sure if this is the correct thought process here
    stopAudio();
  }
}

function playAudio() {
  audio.play();
}
function pauseAudio() {
  audio.pause();
}
function stopAudio() {
  audio.pause();
  audio.src = '';
}
