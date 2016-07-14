var Five = require("johnny-five");
var Tessel = require("tessel-io");

var board = new Five.Board({ io: new Tessel() });

// List the names of each of our methods that we want
// to be able to access from app.js
var bot = {
  commands: ['left', 'right', 'forward', 'reverse', 'stop', 'drive']
};

board.on("ready", function() {

  var left = new Five.Servo({ pin: "b5", type: "continuous" });
  var right = new Five.Servo({ pin: "b6", type: "continuous", invert: true });

  // allServos is a collection containing both servos. When
  // methods are called on allServos, they are (as you might
  // expect)) called on each member of the collection.
  var allServos = new Five.Servos([right, left]);

  bot.forward = function() { allServos.cw(1); };
  bot.reverse = function() { allServos.ccw(1); };
  bot.left = function() { right.cw(1);left.ccw(1); };
  bot.right = function() { right.ccw(1);left.cw(1); };
  bot.stop = function() { allServos.stop(); };

  // Pass in specific values for each servos
  bot.drive = function(opts) {

    if (opts.left > 0) {
      left.ccw(opts.left);
    } else {
      left.cw(opts.left * -1);
    }

    if (opts.right > 0) {
      right.ccw(opts.right);
    } else {
      right.cw(opts.right * -1);
    }

  };
});

module.exports = bot;
