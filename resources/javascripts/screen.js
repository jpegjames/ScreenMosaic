// --- Grid functionality
//
function setGrid(b) {
  if (b == true) {
    $('#grid').show();
  } else if (b == false) {
    $('#grid').hide();
  }
}


// --- Visual functionality
//
function setColor(color) {
  $('#render').css('background-color', color);
}

// set image
function setImage(data, screenToken, screenID) {

  // clear and hide image (end function)
  if (data == null){
    $('#render img#screen-image').attr('src', '#').hide();
    return true;
  }

  // if only path is passed, set same image for all screens (end function)
  if (typeof(data) === 'string') {
    _setSingleImage(data);
    return true;
  }

  // set single image for this screen based off screenToken (end function)
  if (data[screenToken] !== undefined) {
    _setSingleImage(data[screenToken]);
    return true;
  }

  // set single image for this screen based off screenID (end function)
  if (data[screenID] !== undefined) {
    _setSingleImage(data[screenID]);
    return true;
  }

  // preprocessed
  if (data["preprocessed"] !== undefined) {
    _setPreprocessedImage(data["preprocessed"], screenID);
    return true;
  }

  // cover
  if (data["cover"] !== undefined) {
    _setCoverImage(data["cover"]);
    return true;
  }

  // set same image for all screens
  _setSingleImage(data["all"]);
  return true;
}



function _setSingleImage(src) {
  var dom = $('#render img#screen-image');
  dom.removeClass('offset');
  dom.attr('src', src);
  dom.show();
}

function _setPreprocessedImage(unprocessed_src, screenID) {
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(unprocessed_src)[0];
  var processed_src = unprocessed_src.replace(ext, '') + '-' + screenID + ext;

  _setSingleImage(processed_src);
}

function _setCoverImage(src) {
  var dom = $('#render img#screen-image');
  dom.addClass('offset');
  dom.attr('src', src);
  dom.show();
}

// --- Video functionality
//
var video;

function setVideo(data, screenToken, screenID) {
  video = document.getElementById("video");

  if (data[screenToken] !== undefined) {
    // play video for specific screen
    video.src = data[screenToken];
    playVideo();
  } else if (data['all'] !== undefined) {
    // play same video for all screens
    video.src = data['all'];
    playVideo();
    return true;
  }

  if (data[screenID] !== undefined) {
    video.src = data[screenID];
    video.style.display = '';

    playVideo();
  }
}

function hasVideo(){
  return (video !== undefined && video.src != undefined && video.src != '');
}

function playVideo() {
  if (hasVideo()) {
    video.style.display = '';
    video.play();
  }
}
function pauseVideo() {
  if (hasVideo()) {
    video.pause();
  }
}
function rewindVideo() {
  if (hasVideo()) {
    video.currentTime = 0;
  }
}
function stopVideo() {
  if (hasVideo()) {
    video.pause();
    video.style.display = 'none';
    video.src = '';               // this will clear it cached in the DOM
    video.removeAttribute('src'); // this will remove source so that it doesn't use a root url
  }
}
function loopVideo() {
  video.loop = true;
}
function unloopVideo() {
  video.loop = false;
}


// --- Audio functionality
//
var audio = new Audio();

function setAudio(data, screenToken) {
  if (data[screenToken] !== undefined) {
    audio.src = data[screenToken];
    playAudio();
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


// --- Overlay functionality
//

var overlayLeft = 0;
var overlayTop = 0;

function handleOverlayCommand(data) {
  // move x-axis
  if (data['left'] !== undefined) {
    overlayLeft = data['left'];
    $('#overlay').css('left', overlayLeft);
  }

  // move y-axis
  if (data['top'] !== undefined) {
    overlayTop = data['top'];
    $('#overlay').css('top', overlayTop);
  }

  // set content
  if (data['html'] !== undefined) {
    $('#overlay').html(data['html']);
  }

  // hide overlay
  if (data == 'hide') {
    $('#overlay').hide();
  }

  // show overlay
  if (data == 'show') {
    $('#overlay').show();
  }
}

// --- iframe functionality
//

// set iframe
function setIframe(data, screenToken, screenID) {

  // clear and hide iframe (end function)
  if (data == null || data == 'clear' || data == 'stop') {
    _clearIframe();
    return true;
  }

  // set iframe for this screen based off screenToken (end function)
  if (data[screenToken] !== undefined) {
    _setSingleIframe(data[screenToken]);
    return true;
  }

  // set iframe for this screen based off screenID (end function)
  if (data[screenID] !== undefined) {
    _setSingleIframe(data[screenID]);
    return true;
  }
}

function _setSingleIframe(src) {
  $('#iframe').attr('src', src).show();
}

function _clearIframe() {
  $('#iframe').attr('src', '#').hide();
}
