// Realtime communication between the client and server uses
// http://socket.io/
var socket = io();

// For keypresses we use
// https://github.com/dmauro/Keypress
var listener = new window.keypress.Listener();

// For the joystick we use
// https://github.com/jeromeetienne/virtualjoystick.js
var stick = new VirtualJoystick({
  container: document.getElementById("stickContainer"),
  strokeStyle: 'yellow',
  limitStickTravel: true
});

stick.addEventListener('touchStartValidation', function(event) {
  var touch	= event.changedTouches[0];
  return true;
});

var ease = function(n) {
  return n * (2 - n);
};

var greater = function(a, b) {
  return a > b ? a : b;
};

var lesser = function(a, b) {
  return a > b ? b : a;
};

var listener = new window.keypress.Listener();

var socket = io();
socket.emit('newUser');

var commands = [
  {"com": "forward", "key": "up" },
  {"com": "left", "key": "left" },
  {"com": "right", "key": "right" },
  {"com": "reverse", "key": "down" },
  {"com": "stop", "key": "space" },
  {"com": "drive", "key": "d" },
];

var lastLeft, lastRight;
// Store the last sent drive values

// Check the position of the joystick every 100ms
setInterval( function() {

  var left, right;

  var rawForward = Number(stick.deltaY() / 100);
  var rawAz = Number(stick.deltaX() / 100);

  var easedAz = ease(Math.abs(rawAz));
  // If the position has changed

  if (rawAz < 0) easedAz *= -1;

  var maxDiff = rawForward < 0 ? (-1 - rawForward) : (1 - rawForward);

  var diff = easedAz >= 0 ? lesser(maxDiff, easedAz): greater(maxDiff, easedAz);
    // The maxDiff is the difference between 1 and our forward speed

  if ((rawForward < 0 && easedAz > 0) || (rawForward > 0 && easedAz < 0)) {
    left = rawForward + diff;
    right = rawForward - diff;
  }
  if ((rawForward < 0 && easedAz < 0) || (rawForward > 0 && easedAz > 0)) {
    left = rawForward - diff;
    right = rawForward + diff;
  }

  if (left !== lastLeft || right !== lastRight) {
    // If the user has released the joystick
    if (rawForward === 0 && easedAz === 0) {
      socket.emit("stop");
    } else {
      socket.emit("drive", {left: left, right: right});
    }

    lastLeft = left;
    lastRight = right;
  }

}, 1/10 * 1000);

// These are the commands that are bound to
// buttons and keypresses
// Loop through each of our commands
commands.forEach( function(command) {
  command.el = document.getElementById(command.com);

  // Add listeners on the buttons
  command.el.addEventListener("touchstart", function() {
    socket.emit(command.com);
    return false;
  });
  command.el.addEventListener("touchend", function() {
    socket.emit("stop");
  });

  // Listen for keypress events
  listener.register_combo({
    "keys"              : command.key,
    "on_keydown"        : function() { socket.emit(command.com); },
    "on_release"        : function() { socket.emit("stop"); },
    "prevent_default"   : true,
    "prevent_repeat"    : true
  });

});

// Bind event to window so the event works even when the mouse is outside browser
document.addEventListener("mouseup", function() {
    socket.emit("stop");
});

setInterval(function() {
  socket.emit("heartbeat");
}, 1000);
// Helper functions
