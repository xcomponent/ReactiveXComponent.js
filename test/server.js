var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Salut tout le monde !');
});
server.listen(3030);

var requirejs = require('requirejs');
requirejs.config({
        baseUrl: '../src'
});

var API = requirejs('xcomponentAPI');
var api = new API();
console.log(api.createSession);