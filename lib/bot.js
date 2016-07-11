var Five = require("johnny-five");
var Tessel = require("tessel-io");

var board = new Five.Board({ io: new Tessel() });

var bot = {
  commands: ['left', 'right', 'forward', 'reverse', 'stop', 'drive']
};

board.on("ready", () => {

  var left = new Five.Servo({ pin: "b5", type: "continuous" });
  var right = new Five.Servo({ pin: "b6", type: "continuous", invert: true });

  var allServos = new Five.Servos([right, left]);

  bot.forward = function() { allServos.cw(1); };
  bot.reverse = function() { allServos.ccw(1); };
  bot.left = function() { right.cw(1);left.ccw(1); };
  bot.right = function() { right.ccw(1);left.cw(1); };
  bot.stop = function() { allServos.stop(); };

  bot.drive = function(opts) {

    if (opts.left > 0) {
      left.ccw(opts.left/100);
    } else {
      left.cw(opts.left/-100);
    }

    if (opts.right > 0) {
      right.ccw(opts.right/100);
    } else {
      right.cw(opts.right/-100);
    }
  };

});

module.exports = bot;
