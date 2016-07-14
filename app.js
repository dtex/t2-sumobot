// Configurable options --------------------
var pathToStaticFiles = "/app/remote-script/public/";
// -----------------------------------------

var http = require('http');
var url = require('url');
var router = require('routes')();
var fs = require('fs');
var bot = require('./lib/bot.js');
var Io = require('socket.io');

// For routing we use a minimalist option
// https://github.com/aaronblohowiak/routes.js
router.addRoute("/", user);
router.addRoute("/*", staticFile);

// A web server that listens on port 80
var server = http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  var match = router.match(path);
  match.fn(req, res, match);
}).listen(80);

// Realtime communication between the client and server
// http://socket.io/
var io = Io(server);

io.on('connection', function (socket) {

  // Loop through the available commands on the robot and
  // generate listeners on the user's connection
  bot.commands.forEach(function(command){
    socket.on(command, function(opts) {
      bot[command](opts); // Run the command in lib/bot.js
    });
  });
});

function user(req, res, match) {
  sendFile(res, pathToStaticFiles + 'index.html');
}

function staticFile(req, res, match) {
  sendFile(res, pathToStaticFiles + match.splats[0]);
}

function sendFile(res, path) {
  fs.stat(path, function(err, stats) {
    if (stats && stats.isFile()) {
      res.statusCode = 200;
      var rstream = fs.createReadStream(path);
      rstream.pipe(res);
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
}
