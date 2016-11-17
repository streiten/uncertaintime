var express = require('express');
var app = express();
var winston = require('winston');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uncertainTime = require('./libs/uncertainTime.js');

winston.level = 'debug';
winston.add(winston.transports.File, { filename: 'uct.log',  json: false });
winston.log('info', 'Server started...');

// serving the web version

app.use(express.static('public'));
app.get('/',requestHandler);
function requestHandler(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  winston.log('info', 'Serving another request *tick tack*.');
}

// setting up the webserver
http.listen(8888, function(){
  console.log('Tick tacking since 1st of Jan 1970...');
});

// socket for web version
io.on('connection', function(socket){
  winston.log('info', 'A web client connected!');
  io.emit('welcome','Welcome timetraveler...');

  socket.on('disconnect', function(){
    winston.log('info', 'A web client left!');
  });
});

// the uncertain time object
var uct = new uncertainTime('s');

function requestHandler(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  console.log('Serving another request *tick tack*.');
}

http.listen(8888, function(){
    console.log('Tick tacking since 1st of Jan 1970...');
});

// emit time to web clients every secont
function timebroadcast() { 
  io.emit('time', { 
    unit : 's',
    value : uct.time,
    uct: uct.uncertain

  });
}
setInterval(timebroadcast,100);

// utils
function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}