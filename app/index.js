var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uncertainTime = require('./libs/uncertainTime.js');
// var mustache = require('mustache-express');
app.use(express.static('public'));
app.get('/',requestHandler);

io.on('connection', function(socket){
  console.log('A client connected!');
  io.emit('welcome','Welcome timetraveler...');

  socket.on('disconnect', function(){
    console.log('A client left!');
  });
});

function requestHandler(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  console.log('Serving another request *tick tack*.')
}

var uct = new uncertainTime('m');

function timebroadcast() { 
  io.emit('time', { 
    unit : 'm',
    value : uct.time
  });
}

setInterval(timebroadcast,1000);

function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

http.listen(8888, function(){
    console.log('Tick tacking since 1st of Jan 1970...')
});