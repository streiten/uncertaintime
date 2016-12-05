var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');
var path = require('path');


function uncertainTime(u) {
  this.unit = u;
  this.debug = true;
  // reading in the schedule from file
  var schedulePath = path.join(__dirname,'..', 'schedule.json');
  var schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  this.schedule = later.schedule(schedule);
  this.uncertain = false;
  // calculating the time every 100ms
  setInterval(this.distortTime.bind(this),100);
}

uncertainTime.prototype.distortTime = function () {

      var nowtime = new Date();
      var nowtimeInSeconds = Math.floor(nowtime.getTime()/1000);
      
      var nowtimeMinute = new Date(nowtime.setSeconds(0));
      var nowtimeMinuteInSeconds = Math.floor(nowtimeMinute.getTime()/1000);
      console.log('Second:' + (nowtimeInSeconds - nowtimeMinuteInSeconds));
      
      var duration = 60;
      var end = nowtimeMinuteInSeconds + duration;
      
      //console.log('End:' + new Date(end*1000));


      var uncertainTime = new Date(nowtime); 

      switch(this.unit) {
        case 's':
          // var second = uncertainTime.getSeconds();
          //  uncertainTime.getTime()/1000;
          
          if(this.schedule.isValid(uncertainTime) || this.debug ){
            //console.log('NowTime in seconds:' + ( nowtimeInSeconds));
            var seconds = distortFunction(nowtimeInSeconds,nowtimeMinuteInSeconds,end);
            console.log('Seconds new:' + ( seconds));

            this.uncertain = true;
            //console.log("It's the time again:" + uncertainTime );
          } else {
            this.uncertain = false;
          }
          uncertainTime.setTime(seconds * 1000);
        
        break;         
        
        // case 'm':
        //   var minute = uncertainTime.getMinutes();
        //   if(this.schedule.isValid(uncertainTime) || this.debug ){
        //     var minute = distortFunction(minute,0,60);
        //     this.uncertain = true;
        //     //console.log("It's the time again:" + uncertainTime );
        //   } else {
        //     this.uncertain = false;
        //   }
        //   uncertainTime.setMinutes(minute);
        
        // break; 
      }

  this.time = uncertainTime;
  this.timederrivation = (uncertainTime.getTime() - nowtime.getTime())/1000;
  // console.log(this.timederrivation );

};

function distortFunction(val,start,end) {
  
  var diff = end - start;

  console.log('Val:' + val);
  console.log('Start:' + start);
  console.log('End:' + end);
  console.log('Diff:' + diff);

  var result = Math.floor(easing.easeInOutQuad(val,start,diff,diff));

  console.log('Result:' + result);

  return result; 
}

module.exports = uncertainTime;