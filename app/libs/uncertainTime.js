var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');

function uncertainTime(u) {
  this.unit = u;
  this.debug = true;
  // reading in the schedule from file
  var schedule = JSON.parse(fs.readFileSync('./schedule.json', 'utf8'));
  this.schedule = later.schedule(schedule);
  this.uncertain = false;
  // calculating the time every 100ms
  setInterval(this.distortTime.bind(this),100);
}

uncertainTime.prototype.distortTime = function () {

      var nowtime = new Date();
      var uncertainTime = new Date(nowtime); 

      switch(this.unit) {
        case 's':
          var second = uncertainTime.getSeconds();
          if(this.schedule.isValid(uncertainTime) || this.debug ){
            var second = distortFunction(second);
            this.uncertain = true;
            //console.log("It's the time again:" + uncertainTime );
          } else {
            this.uncertain = false;
          }
          uncertainTime.setSeconds(second);
        
        break;         
        
        case 'm':
          var minute = uncertainTime.getMinutes();
          if(this.schedule.isValid(uncertainTime) || this.debug ){
            var minute = distortFunction(minute);
            this.uncertain = true;
            //console.log("It's the time again:" + uncertainTime );
          } else {
            this.uncertain = false;
          }
          uncertainTime.setMinutes(minute);
        
        break; 
      }

  this.time = uncertainTime;
  this.timederrivation = (uncertainTime.getTime() - nowtime.getTime())/1000;
  // console.log(this.timederrivation );

};

function distortFunction(val) {
  var result = Math.floor(easing.easeInOutQuad(val,0,60,60));
  return result; 
}

module.exports = uncertainTime;