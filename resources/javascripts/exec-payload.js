var socket = io();
var payloadTimer;
var currentKeyframe = 0;
var currentKeyframeIndex = 0;
var currentPayload;



// Functions
//
function setPayloadTimer(payload) {
  if (currentPayload === undefined) {
    currentPayload = payload;
  }

  if (currentPayload != payload) {
    clearPayloadTimer();
  }

  previousKeyframe = currentKeyframe;
  currentKeyframe = payloadKeyframes(payload)[currentKeyframeIndex];
  delay = Math.max((currentKeyframe - previousKeyframe), 0)

  console.log(currentKeyframe);
  console.log(delay);

  payloadTimer = setTimeout(function() {
    execPayload(payload, currentKeyframe)
  }, delay);
}

function clearPayloadTimer() {
  clearTimeout(payloadTimer);
  currentKeyframe = 0;
  currentKeyframeIndex = 0;
  currentPayload = undefined;
}

function payloadKeyframes(payload) {
  return $.map(Object.keys(payload), function(n) {
    return Number(n);
  })
}

function execPayload(payload, keyframe) {
  $.each(payload[keyframe], function(key, value) {
      socket.emit(key, value);
  });

  currentKeyframeIndex += 1;
  if (currentKeyframeIndex < payloadKeyframes(payload).length) {
    setPayloadTimer(payload);
  } else {
    clearPayloadTimer();
  }
}
