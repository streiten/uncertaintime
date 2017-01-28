var twit = require('twit');  
var path = require('path');
var util = require('util');
var winston = require('winston');

var config = require(path.join(__dirname,'..', 'twitter_config.js'));  

function uncertainBot(){
  this.twitter = new twit(config);  
};

uncertainBot.prototype.tweet = function (tweetTxt) {  
    var tweet = {
        status: tweetTxt
    }

    this.twitter.post('statuses/update', tweet, function(err, data, response) {
      if(err){
        winston.log('info','Error tweeting: ' + err);
      }
      else{
        winston.log('info','Sucessfully tweeted: ' + tweetTxt);
      }
    });
};

module.exports = uncertainBot;