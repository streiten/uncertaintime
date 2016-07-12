var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// var mustache = require('mustache-express');
app.use(express.static('public'));
app.get('/',requestHandler);

io.on('connection', function(socket){
  console.log('A Client connected!');
  io.emit('welcome','Hi new client!');

  socket.on('disconnect', function(){
    console.log('A Client disconnected!');
  });
});

function requestHandler(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  console.log('Serving another request (sigh)')
}

http.listen(8888, function(){
    console.log('Serving you since 1st of Jan 1970...')
});

var timebroadcast = function() { 
    setTimeout(function() {
      io.emit('time', new Date());
    timebroadcast();
  }
,1000)};

timebroadcast();