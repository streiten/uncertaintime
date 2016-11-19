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

      var date = new Date();
    
      switch(this.unit) {
        case 's':
          var second = date.getSeconds();
          if(this.schedule.isValid(date) || this.debug ){
            var second = distortFunction(second);
            this.uncertain = true;
            //console.log("It's the time again:" + date );
          } else {
            this.uncertain = false;
          }
          date.setSeconds(second);
        
        break;         
        
        case 'm':
          var minute = date.getMinutes();
          if(this.schedule.isValid(date) || this.debug ){
            var minute = distortFunction(minute);
            this.uncertain = true;
            //console.log("It's the time again:" + date );
          } else {
            this.uncertain = false;
          }
          date.setMinutes(minute);
        
        break; 
      }

  this.time = date;

};

function distortFunction(val) {
  var result = Math.floor(easing.easeInOutQuad(val,0,60,60));
  return result; 
}

module.exports = uncertainTime;