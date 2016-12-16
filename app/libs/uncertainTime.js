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
  this.minute = new Date().getMinutes();
  // calculating the time every 100ms
  setInterval(this.distortTime.bind(this),1000);
}

uncertainTime.prototype.distortTime = function () {

      var durationMins = 3;

      var nowtime = new Date();
      var nowtimeInSeconds = Math.floor(nowtime.getTime()/1000);
      var nowtimeMinute = new Date(nowtime);
      
      if(nowtimeMinute.getMinutes() % durationMins == 0) {
        this.minute = nowtimeMinute.getMinutes();
      }

      console.log('nowtimeminute: ' + this.minute);
      
      nowtimeMinute.setMinutes(this.minute);
      nowtimeMinute.setSeconds(0);

      var nowtimeMinuteInSeconds = Math.floor(nowtimeMinute.getTime()/1000);
      
      var duration = 60 * durationMins;
      var end = nowtimeMinuteInSeconds + duration;
      
      console.log('Now:' + nowtime);
      console.log('Start:' + new Date(nowtimeMinute));
      console.log('End:' + new Date(end*1000));
      
      var uncertainTime = new Date(nowtime); 
      
      if(this.schedule.isValid(uncertainTime) || this.debug ){
        //console.log('NowTime in seconds:' + ( nowtimeInSeconds));
        var seconds = distortFunction(nowtimeInSeconds,nowtimeMinuteInSeconds,end);

        this.uncertain = true;
        //console.log("It's the time again:" + uncertainTime );
      } else {
        this.uncertain = false;
      }
      uncertainTime.setTime(seconds * 1000);
        
  this.time = uncertainTime;
  this.timederrivation = (uncertainTime.getTime() - nowtime.getTime())/1000;
  // console.log(this.timederrivation );

};

function distortFunction(val,start,end) {
  
  var diff = end - start;
  var val = val - start; 

  console.log('Val:' + val);
  console.log('Start:' + start);
  console.log('End:' + end);
  console.log('Diff:' + diff);

  var result = Math.floor(easing.easeInOutQuad(val,0,diff,diff));

  console.log('Result:' + result);
  result = result + start;

  // console.log('Result:' + result);

  return result; 
}

module.exports = uncertainTime;