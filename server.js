// Server Sent Events contrived example
// Send a bunch of JSON (served from disk) until there's no more to send
// Might be useful for application data that can be loaded once application is in a 'bootable'
// state - I was specifically thinking of shape data in GeoJSON format when I wrote this.

var http = require('http'),
    zlib = require('zlib'),
    fs = require('fs'),
    crypto = require('crypto');

var files = fs.readdirSync(__dirname).filter(function(f) { return /\.json/gi.test(f); });

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Encoding': 'gzip'
  });

  var file = files.shift();
  if (file) {
    var id = crypto.createHash('md5').update(file).digest("hex"),
        fileReadStream = fs.createReadStream(file, {encoding: 'utf-8'}),
        map = require('map-stream'),
        createSSE = map(function (data, cb) {
          var NEWLINE = '\n',
              out = "id:" + id + NEWLINE + "data:" + JSON.stringify(data) + NEWLINE + NEWLINE;

          cb(null, out);
        });

    // stream the potentially large file from disk
    fileReadStream
      // transform it to conform to SSE message standard
      .pipe(createSSE)
      // compress it
      .pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION}))
      // send it to the client
      .pipe(res);
  }
}


http.createServer(function(req, res) {
  if (req.url == '/suburbs')
    sendSSE(req, res);
}).listen(9090);