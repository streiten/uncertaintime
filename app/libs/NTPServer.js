var path = require('path');
var appConfig = require(path.join(__dirname,'..', 'config.js'));

var winston = require('winston');
var dgram = require("dgram");
var UDP = dgram.createSocket("udp4");
var dns = require("dns");
var moment = require("moment");
var uct = require( './uncertainTime.js');
var PiwikTracker = require('piwik-tracker');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(NTPServer, EventEmitter);

function NTPServer (port) {

  this.time_server_domain = "pool.ntp.org";

  this.client_pool = [];
  this.time_server_ip = '';
  this.port = port;

  this.refreshNTPServerIp();
  setInterval(this.refreshNTPServerIp.bind(this),1000 * 60 * 60 * 3);

  // actually should wait for refreshNTPServerIp
  UDP.on("message",this.UDPMessageHandler.bind(this));

  UDP.on("listening", function() {
    var address = UDP.address();
    winston.log('info', "Uncertain NTP server listening at " + address.address + " on " + address.port);
  });
  
  UDP.bind(port);

  this.piwik = new PiwikTracker(1, 'http://uncertaintime.com:3000/piwik/piwik.php');
  this.piwikBaseUrl = 'http://uncertaintime.com';

  piwik.track({
      url: this.piwikBaseUrl + '/NTP',
      action_name: 'NTPServer started',
      e_c:'System',
      e_a:'Start'
  });

}

NTPServer.prototype.UDPMessageHandler = function(msg, rinfo) {
      
    winston.log('info', ["UDP message from ", rinfo.address, ":", rinfo.port].join(''));

    // request ip != ntp server => message from client
    if (rinfo.address != this.time_server_ip) { 

      winston.log('info', 'client ' + rinfo.address + ' sent NTP packet...' );

      this.piwik.track({
          url: this.piwikBaseUrl + '/NTP',
          action_name: 'NTPServer request',
          e_c:'NTP',
          e_a:'request',
          token_auth: appConfig.piwik.token,
          cip: rinfo.address 
      });

      this.client_pool.push({
        address: rinfo.address,
        port: rinfo.port
      });

      // pass the ntp packet from client on to the current NTP Server
      // move to method 'getRealTime'
      var UDPsendCallback = function(err, bytes) {
        if (err) throw err;
        winston.log('info','passing the message on to real NTP...');
      };

      UDP.send(msg, 0, msg.length, 123, this.time_server_ip, UDPsendCallback.bind(this));

    // request ip = ntp server => recieving msg from ntp server
  } else {

      winston.log('info', 'the real NTP responded...');
      
      var time_standard = msg.readUInt32BE(32);

      winston.log('info', 'timederrivation is ' + uct.timederrivation);

      // adjusting the time 
      msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 16);
      msg.writeUInt32BE(time_standard + uct.timederrivation, msg.length - 8);

      this.respondClients(msg);
    }
};

NTPServer.prototype.refreshNTPServerIp = function (){
    // get a timeserver

    var dnsLookupCallback = function(err, ip, ipv) {

      if (err) {
        winston.log('error', 'Error in DNS Lookup!');
        winston.log('error',err);
        return;
      }

      this.time_server_ip = ip;
      winston.log('info', 'New NTP Server IP is: '+ this.time_server_ip);
      };

      dns.lookup(this.time_server_domain, 4, dnsLookupCallback.bind(this));
};


NTPServer.prototype.respondClients = function(msg){
      while (this.client_pool.length != 0) { 

        (function(to_ip, to_port) {
          // send the message to this client
          UDP.send(msg, 0, msg.length, to_port, to_ip, function(err, bytes) {
            if (err) throw err;
            winston.log('info','responding to ' + to_ip + ':' + to_port);
          });
        })(this.client_pool[0].address, this.client_pool[0].port);
        
        // removing the client from clients list
        this.client_pool.splice(0, 1);

      }
};

module.exports = NTPServer;
