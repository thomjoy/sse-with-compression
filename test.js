var express = require('express'),
    app = express(),
    http = require('http'),
    cors = require('cors'),
    zlib = require('zlib'),
    jsonpack = require('jsonpack/main'),
    fs = require('fs'),
    crypto = require('crypto'),
    concat = require('concat-stream'),
    through = require('through');

var bondi = [__dirname + "/bondi.json"];
var rs = fs.createReadStream(__dirname + "/bondi.json", "utf-8");
var map = require('map-stream');

var transform = map(function (data, cb) {
  var out = "id: 1234\ndata: " + data + "\n\n";
  cb(null, out);
});

rs.pipe(transform).pipe(process.stdout);