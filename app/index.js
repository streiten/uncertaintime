var express = require('express');
var app = express();
var winston = require('winston');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var uncertainTime = require('./libs/uncertainTime.js');
var NTPServer = require('./libs/NTPServerOOP.js');

if(process.env.NODE_ENV == "development") {
  winston.level = 'debug';
} else {
  winston.level = 'debug';
}

winston.add(winston.transports.File, { filename: 'uct.log',  json: false });
winston.log('info', 'Server started...');

// NTP Port 
// port mapped by ufw to privileged ports 123 and 80 in production  
var ntpport = 1234; 
var httpport = 8080;

/**
 * The Uncertime
 */

var uct = new uncertainTime();

/**
 * The Webserving
 */

app.use(express.static('public'));

app.get('/',requestHandlerHome);
app.get('/debug',requestHandlerDebug);

function requestHandlerHome(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  winston.log('info', 'Serving another Home request *tick tack*.');
}

function requestHandlerDebug(request, response) {
  response.sendFile( __dirname + '/views/debug.html');
  winston.log('info', 'Serving another Debug request *tick tack*.');
}

http.listen(httpport, function(){
  winston.log('info', 'Tick tacking since 1st of Jan 1970... on ' + httpport);
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

ntps = new NTPServer(ntpport);

ntps.on('requestUncerainTime',requestUncerainTimeHandler);

function requestUncerainTimeHandler(data) {
  winston.log('info', 'requestUncerainTimeHandler');
}

// utils
function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}