var express = require('express');
var app = express();
var winston = require('winston');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var uct = require('./libs/uncertainTime.js');
var NTPServer = require('./libs/NTPServer.js');
var uncertainBot = require('./libs/uncertainBot.js');


if(process.env.NODE_ENV == "development") {
  winston.level = 'debug';
} else {
  winston.level = 'debug';
}

winston.add(winston.transports.File, { filename: 'uct.log',  json: false });
winston.log('info', 'Server started... in environment: ' + process.env.NODE_ENV);

// NTP Port 
// port mapped by ufw to privileged ports 123 and 80 in production  
var ntpport = 1234; 
var httpport = 8080;

/**
 * The Uncertime
 */


uct.on('uncertainPeriodChanged',uncertainPeriodChangedHandler);
function uncertainPeriodChangedHandler (msg) {
  
  switch(msg) {
    case 'start':
      var text = "A new uncertain period started.";
    break;

    case 'end':
      var text = "The uncertaint time ended after about ";
      text += this.end.from(this.start,true) + '. What ';

      switch(uct.distortFunction) {
        case 0: 
          text += 'a crazy one.';
        break;
        
        case 1:
          text += 'a freeze.';
        break;

        case 2: 
          text += 'smooth operator.';
        break;
      }
    break;
  }

  if(process.env.NODE_ENV == "production") {
    uBot.tweet(text);
  }
  
  winston.log('info', text);
}


/**
 * The Webserving
 */

app.use(express.static('public'));

app.get('/',requestHandlerHome);
app.get('/debug',requestHandlerDebug);

function requestHandlerHome(request, response) {
  response.sendFile( __dirname + '/views/index.html');
  winston.log('info', 'Serving another Home request ' + request.hostname + ' to ' + request.ip );
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
      value : uct.time,
      uct: uct.uncertain
    });
  });

  socket.on('getperiod', function(){
    // winston.log('info', 'Websocket time requested... and served...');
    io.emit('period', { 
      start : uct.start,
      end: uct.end
    });
  });

  socket.on('disconnect', function(){
    winston.log('info', 'A web client left!');
  });
});


/**
 * The NTP Serving
 */

ntps = new NTPServer(ntpport);

ntps.on('getUncertainTime',getUncertainTimeHandler);
function getUncertainTimeHandler(msg) {
  ntps.emit('respondClients', msg, uct.timederrivation );
}

// utils
function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}


