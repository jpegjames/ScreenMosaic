// (resources)

// -----------------------------
// Screen Command Functions
// -----------------------------
//

function muteScreens() {
  socket.emit('screen instruction', 'mute');
}
function unmuteScreens() {
  socket.emit('screen instruction', 'unmute');
}
function clearImages() {
  socket.emit('screen image', null);
}

function showGrid() {
  socket.emit('screen grid', true);
}
function hideGrid() {
  socket.emit('screen grid', false);
}

function showTokens() {
  socket.emit('screen instruction', 'show-token');
}
function hideTokens() {
  socket.emit('screen instruction', 'hide-token');
}

function refreshScreens() {
  socket.emit('screen instruction', 'refresh');
}


function sendScreenPositionUpdate() {
  socket.emit('screen instruction', {
    token: currentScreen["token"],
    top: currentScreen["top"] * -1 + 'px',
    left: currentScreen["left"] * -1 + 'px',
    scale: currentScreen["scale"]
  });
}

// -----------------------------
// Admin Functions
// -----------------------------
//
