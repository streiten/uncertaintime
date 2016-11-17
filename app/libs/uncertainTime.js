var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');

function uncertainTime(u) {
  self = this;
  this.unit = u;
  
  // reading in the schedule from file
  var schedule = JSON.parse(fs.readFileSync('./schedule.json', 'utf8'));
  this.schedule = later.schedule(schedule);
  this.uncertain = false;
  // calculating the time every 100ms
  setInterval(this.distortTime,100);
}

uncertainTime.prototype.distortTime = function () {

      var date = new Date();
    
      switch(self.unit) {
        case 's':
         
          var second = date.getSeconds();

          if(self.schedule.isValid(date)){
            var second = distortFunction(second);
            self.uncertain = true;
            //console.log("It's the time again:" + date );
          } else {
            self.uncertain = false;
          }

          date.setSeconds(second);
        
        break;         
        
        case 'm':
        
          var minute = date.getMinutes();

          if(self.schedule.isValid(date)){
            var minute = distortFunction(minute);
            self.uncertain = true;

            //console.log("It's the time again:" + date );
          } else {
            self.uncertain = false;
          }
        
          date.setMinutes(minute);
        
        break; 
      }

  self.time = date;

}

function distortFunction(val) {
  var result = Math.floor(easing.easeInOutQuad(val,0,60,60));
  return result; 
}

module.exports = uncertainTime;