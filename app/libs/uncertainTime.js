var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');
var path = require('path');
 
function uncertainTime() {
  this.debug = true;
  // reading in the schedule from file
  
  var schedulePath = path.join(__dirname,'..', 'schedule.json');
  var schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  this.later = later.schedule(schedule);

  if(this.debug) {
    this.initDebug();
  }

  this.uncertain = false;  
  // calculating the time every 100ms
  setInterval(this.distortTime.bind(this),100);
}

uncertainTime.prototype.distortTime = function () {

      var nowtime = new Date(); 
      var uncertainTime = new Date(nowtime); 
      var timeInSeconds = uncertainTime.getTime()/1000;
      
      if(this.debug || this.uncertain ){

        var timeInSeconds = distortFunction(uncertainTime.getTime()/1000,this.start.getTime()/1000,this.end.getTime()/1000);

        this.uncertain = true;
        //console.log("It's the time again:" + uncertainTime );
      } else {
        this.uncertain = false;
      }

      uncertainTime.setTime(timeInSeconds * 1000);
      this.time = uncertainTime;

      // truncate decimal with | 0 -> makes it 32 bit integer
      this.timederrivation = ((uncertainTime.getTime() - nowtime.getTime())/1000 ) | 0 ;

};

function distortFunction(val,start,end) {
  
  var diff = end - start;
  var val = val - start; 

  // console.log('Val:' + val);
  // console.log('Start:' + start);
  // console.log('End:' + end);
  // console.log('Diff:' + diff);

  var result = Math.floor(easing.easeInOutQuad(val,0,diff,diff));

  // console.log('Result:' + result);
  result = result + start;

  // console.log('Result:' + result);

  return result; 
}

uncertainTime.prototype.initDebug = function () {
    // set initial start end
    var debugNow = new Date();
    if(debugNow.getMinutes() % 2 == 0){
      this.start = new Date(debugNow.setSeconds(0));
      this.end = new Date(this.start.getTime() + 120000); 
    } else {
      this.start =  new Date((new Date(debugNow.setSeconds(0))).getTime() - 60000);
      this.end = new Date(this.start.getTime() + 120000); 
    }

    // set start end every 2 mins 
    debugSchedule = later.parse.text('every 2 min');
    t = later.setInterval(setStartEnd.bind(this), debugSchedule);
    function setStartEnd(){
      this.start = new Date();
      this.end = new Date(this.start.getTime() + 120000); 
    };
}

module.exports = uncertainTime;