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
    $('#render img').attr('src', '#').hide();
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
  var dom = $('#render img');
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
  var dom = $('#render img');
  dom.addClass('offset');
  dom.attr('src', src);
  dom.show();
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
