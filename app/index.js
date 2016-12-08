var express = require('express');
var app = express();
var winston = require('winston');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var uncertainTime = require('./libs/uncertainTime.js');
var NTPServer = require('./libs/NTPServer.js');

winston.level = 'debug';
winston.add(winston.transports.File, { filename: 'uct.log',  json: false });
winston.log('info', 'Server started...');

/**
 * The Uncertime
 */

var uct = new uncertainTime();

/**
 * The Webserving
 */

app.use(express.static('public'));
app.get('/',requestHandler);

function requestHandler(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  winston.log('info', 'Serving another request *tick tack*.');
}

http.listen(8080, function(){
  console.log('Tick tacking since 1st of Jan 1970...');
});


io.on('connection', function(socket){

  winston.log('info', 'A web client connected!');
  io.emit('welcome','Welcome timetraveler...');

  socket.on('gettime', function(){
    // winston.log('info', 'Websocket time requested... and served...');
    io.emit('time', { 
      unit : 's',
      value : uct.time,
      uct: uct.uncertain
    });
  })

  socket.on('disconnect', function(){
    winston.log('info', 'A web client left!');
  });
});


/**
 * The NTP Serving
 */

ntps = new NTPServer(1234);

ntps.on('requestUncertime',requestUncertimeHandler);
function requestUncertimeHandler(data) {
  // send time back to NTPS... ??? 
}

// utils
function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}