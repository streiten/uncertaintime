var easing = require('easing-js');
var util = require('util');

function uncertainTime(u) {
  self = this;
  this.unit = u;
  setInterval(this.distortTime,100);

};

uncertainTime.prototype.distortTime = function () {
      
      var date = new Date();
      switch(self.unit) {
        case 's':
          var second = date.getSeconds();
          var distortedSecond = distortFunction(second);
          date.setSeconds(distortedSecond);
        break;         
        case 'm':
          var minute = date.getMinutes();
          var distortedMinute = distortFunction(minute);
          date.setMinutes(distortedMinute);
        break; 
      }

  self.time = date;
}



function distortFunction(val) {
  var result = Math.floor(easing.easeInOutQuad(val,0,60,60));
  return result; 
}

module.exports = uncertainTime;