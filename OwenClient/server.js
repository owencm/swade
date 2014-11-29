var static = require('node-static');

var path = require("path");
var file = new(static.Server)(path.join(__dirname, "public"), {cache: 0});

require('http').createServer(function (request, response) {
  file.serve(request, response);
}).listen(8000);