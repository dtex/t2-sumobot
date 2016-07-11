var Five = require("johnny-five");
var Tessel = require("tessel-io");

var board = new Five.Board({ io: new Tessel() });

var bot = {
  commands: ['left', 'right', 'forward', 'reverse', 'stop', 'drive']
};

board.on("ready", () => {

  var left = new Five.Servo({ pin: "b5" });
  var right = new Five.Servo({ pin: "a5", type: "continuous" });

  left.to(0);
  console.log("cw");

  setTimeout(() => {
    left.to(90);
    console.log("stop");
  }, 5000);

  setTimeout(() => {
    left.to(180);
    console.log("ccw");
  }, 10000);

  setTimeout(() => {
    left.to(90);
    console.log("stop");
  }, 15000);
});
