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

// Store the last sent drive values
var lastForward, lastAz;

// Check the position of the joystick every 100ms
setInterval( function() {

  var left, right;

  var rawForward = Number(stick.deltaY() / 100);
  var rawAz = Number(stick.deltaX() / 100);

  // If the position has changed
  if (rawForward !== lastForward || rawAz !== lastAz) {

    var easedAz = ease(Math.abs(rawAz));

    if (rawAz < 0) easedAz *= -1;

    // The maxDiff is the difference between 1 and our forward speed
    var maxDiff = rawForward < 0 ? (-1 - rawForward) : (1 - rawForward);

    var diff = easedAz >= 0 ? lesser(maxDiff, easedAz): greater(maxDiff, easedAz);

    if ((rawForward < 0 && easedAz > 0) || (rawForward > 0 && easedAz < 0)) {
      left = rawForward + diff;
      right = rawForward - diff;
    }
    if ((rawForward < 0 && easedAz < 0) || (rawForward > 0 && easedAz > 0)) {
      left = rawForward - diff;
      right = rawForward + diff;
    }

    // If the user has released the joystick
    if (rawForward === 0 && easedAz === 0) {
      socket.emit("stop");
    } else {
      socket.emit("drive", {left: left, right: right});
    }

    lastForward = rawForward;
    lastAz = rawAz;
  }

}, 1/10 * 1000);

// These are the commands that are bound to
// buttons and keypresses
var commands = [
  {"com": "forward", "key": "up" },
  {"com": "left", "key": "left" },
  {"com": "right", "key": "right" },
  {"com": "reverse", "key": "down" },
  {"com": "stop", "key": "space" }
];

// Loop through each of our commands
commands.forEach( function(command) {

  // Add listeners on the buttons
  command.el = document.getElementById(command.com);
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

// Helper functions
function ease(n) {
  return n;
  //return n * (2 - n);
}

function greater(a, b) {
  return a > b ? a : b;
}

function lesser(a, b) {
  return a > b ? b : a;
}
