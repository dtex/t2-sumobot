// Configurable options --------------------
var pathToStaticFiles = "/app/remote-script/public/";
// -----------------------------------------

var http = require('http');
var url = require('url');
var router = require('routes')();
var fs = require('fs');
var bot = require('./lib/bot.js');
var Io = require('socket.io');

router.addRoute("/", user);
router.addRoute("/*", staticFile);

var server = http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  var match = router.match(path);

  match.fn(req, res, match);

}).listen(80);

var io = Io(server);

io.on('connection', function (socket) {
  // Generate handlers on the user's connection for each method on bot
  bot.commands.forEach(function(command){
    socket.on(command, function(opts) {
      console.log(command);
      bot[command](opts);
    });
  });
});

function user(req, res, match) {
  res.statusCode = 200;
  var rstream = fs.createReadStream(pathToStaticFiles + 'index.html');
  rstream.pipe(res);
}

function staticFile(req, res, match) {
  fs.stat(pathToStaticFiles + match.splats[0], function(err, stats) {
    if (stats && stats.isFile()) {
      res.statusCode = 200;
      var rstream = fs.createReadStream(pathToStaticFiles + match.splats[0]);
      rstream.pipe(res);
    } else {
      res.statusCode = 404;
    }
  });
}
