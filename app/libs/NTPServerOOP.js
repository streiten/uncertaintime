
var winston = require('winston');
var dgram = require("dgram");
var UDP = dgram.createSocket("udp4");
var dns = require("dns");

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(NTPServer, EventEmitter);

//var uncertainTime = require('./uncertainTime.js');

function NTPServer (port) {

  // this.uct = new uncertainTime('m');

  this.time_server_domain = "pool.ntp.org";

  this.client_pool = [];
  this.time_server_ip = '';
  this.prev_checktime = 0;
  this.port = port;

  UDP.on("message",this.UDPMessageHandler.bind(this));

  UDP.on("listening", function() {
    var address = UDP.address();
    winston.log('info', "NTP server listening at " + address.address + " on " + address.port);
  });

  this.refreshNTPServerIp();
  setInterval(this.refreshNTPServerIp.bind(this),1000 * 60 * 60 * 3);

  UDP.bind(port);
}


NTPServer.prototype.UDPMessageHandler = function(msg, rinfo) {
      
    winston.log('info', 'OK OK i am handling now....');
    winston.log('info', ["  message from ", rinfo.address, ":", rinfo.port].join(''));

    // request ip != ntp server => message from client
    if (rinfo.address != this.time_server_ip) { //time sync request from client

      winston.log('info', rinfo.address + ' is different with ' + this.time_server_ip);
      // add client to client list
      
      this.client_pool.push({
        address: rinfo.address,
        port: rinfo.port
      });
      
      // pass the ntp packet from client on to the current NTP Server
      // move to method 'getRealTime'
      UDP.send(msg, 0, msg.length, 123, this.time_server_ip, function(err, bytes) {
        if (err) throw err;
        winston.log('info','passing on to real NTP');
      });

    // request ip = ntp server => recieving msg from ntp server
  } else {

      // find time from message 
      var time_standard = msg.readUInt32BE(32);

      this.emit('requestUncerainTime');
      // ... send time to clients on event the following code moved to a function 
      //console.log('The time is off by:' + uct.timederrivation);

      // adjusting the time
      //msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 16);
      //msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 8);

      // send the new time to all clients
      while (this.client_pool.length != 0) { 

        (function(to_ip, to_port) {
          // send the message to this client
          UDP.send(msg, 0, msg.length, to_port, to_ip, function(err, bytes) {
            if (err) throw err;
            winston.log('info','responding to ' + to_ip + ':' + to_port);
          });
        })(client_pool[0].address, client_pool[0].port);
        
        // removing the client from clients list
        client_pool.splice(0, 1);

      }
    }
};

NTPServer.prototype.refreshNTPServerIp = function (){
    // get a timeserver
    dns.lookup(this.time_server_domain, 4, function(err, ip, ipv) {

      if (err) {
        winston.log('error', 'Error in DNS Lookup!');
        winston.log('error',err);
        return;
      }

      this.time_server_ip = ip;
      winston.log('info', 'New NTP Server IP is: '+ ip);
      }
    );
};



NTPServer.prototype.getNTPTime = function (){
  
};

NTPServer.prototype.getUncertainTime = function (){
  
};

module.exports = NTPServer;
