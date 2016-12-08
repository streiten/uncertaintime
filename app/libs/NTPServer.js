
var winston = require('winston');
var dgram = require("dgram");
var UDP = dgram.createSocket("udp4");
var dns = require("dns");

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(NTPServer, EventEmitter);

var uncertainTime = require('./uncertainTime.js');

function NTPServer (port) {

  var uct = new uncertainTime('m');

  var time_server_domain = "pool.ntp.org";

  var client_pool = [];
  var time_server_ip = '';
  var prev_checktime = 0;
  var ttl = 10000;

  this.port = port;

  UDP.on("message", function(msg, rinfo) {

// ---->>> serverMessageHandler <<<-----
    
    var serverMessageHandler = function() {

      console.log(new Date());
      console.log(["  message from ", rinfo.address, ":", rinfo.port].join(''));

    // request ip != ntp server => message from client
    if (rinfo.address != time_server_ip) { //time sync request from client

      console.log(rinfo.address + ' is different with ' + time_server_ip);
      
      // add client to client list
      client_pool.push({
        address: rinfo.address,
        port: rinfo.port
      });
      
      // pass the ntp packet from client on to the current NTP Server
      // move to method 'getRealTime'
      UDP.send(msg, 0, msg.length, 123, time_server_ip, function(err, bytes) {
        if (err) throw err;
        console.log(new Date());
        console.log('  ask to sent to ' + time_server_domain);
      });

    // request ip = ntp server => recieving msg from ntp server
  } else {

      // find time from message 
      var time_standard = msg.readUInt32BE(32);

      // this.emit('requestUncertime');
      // ... send time to clients on event the following code moved to a function 

      console.log('The time is off by:' + uct.timederrivation);

      // adjusting the time
      msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 16);
      msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 8);

      // send the new time to all clients
      while (client_pool.length != 0) { 

        (function(to_ip, to_port) {
          // send the message to this client
          UDP.send(msg, 0, msg.length, to_port, to_ip, function(err, bytes) {
            if (err) throw err;
            console.log(new Date());
            console.log('  response to ' + to_ip + ':' + to_port);
          });
        })(client_pool[0].address, client_pool[0].port);
        
        // removing the client from clients list
        client_pool.splice(0, 1);

      }
    }
  };

// ---->>> serverMessageHandler END <<<-----
  
  ///// only if ttl expired --> get new NTP Server
  if (prev_checktime + ttl < (new Date()).getTime()) { //TTL 3 hours

    console.log('\n\nTTL Expired '+prev_checktime+' '+(new Date()).getTime()+'. Relookup ' + time_server_domain);
    
    // get a timeserver
    dns.lookup(time_server_domain, 4, function(err, ip, ipv) {

      if (err) {
        console.log('Error in DNS Lookup');
        console.log(err);
        return
      }

      time_server_ip = ip;
      
      // for ttl check
      prev_checktime = (new Date()).getTime();

      console.log('Prev Checktime is '+prev_checktime);
      console.log('Got ip address: '+ ip);
      
      // handle the request
      serverMessageHandler();
    });

  } else {
    
    serverMessageHandler();
  }

});

  // ?
  UDP.on("listening", function() {
    var address = UDP.address();
    console.log("NTP server listening at " + address.address + " on " + address.port);
  });

  UDP.bind(port);
}

NTPServer.prototype.getNewNTPServerIp = function (){

}

NTPServer.prototype.getNTPTime = function (){
  
}

NTPServer.prototype.getUncertainTime = function (){
  
}

module.exports = NTPServer;
