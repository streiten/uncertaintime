var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');
var path = require('path');
var moment = require("moment");
 
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
  this.timederrivation = 0;
  // calculating the time every 100ms
  setInterval(this.distortTime.bind(this),100);
}

uncertainTime.prototype.distortTime = function () {

      var realTime = moment();
      
      if(this.debug){

          // unix() mutability... issue ?
        var timeInSeconds = distortFunction(realTime.unix(),this.start.unix(),this.end.unix());

        //console.log("It's the time again:" + uncertainTime );
        this.time = moment(timeInSeconds);
        
        // truncate decimal with | 0 -> makes it 32 bit integer
        this.uncertain = true;
        // moment uncertainTime.duration(realtime)
        //this.timederrivation = ((uncertainTime.getTime() - nowtime.getTime())/1000 ) | 0 ;

        console.log('Start',this.start);
        console.log('End',this.end);
        console.log('RT:',realTime);
        console.log('UT:',this.time);
      
      } else {
      
        this.uncertain = false;
        this.timederrivation = 0; 
        this.time = realTime;
      
      }
};

function distortFunction(val,start,end) {
  
  var diff = end - start;
  var val = val - start; 

  console.log('Val:' + val);
  console.log('Start:' + start);
  console.log('End:' + end);
  console.log('Diff:' + diff);

  // why floor
  var result = Math.floor(easing.easeInOutQuad(val,0,diff,diff));  
  return result + start;
}

uncertainTime.prototype.initDebug = function () {
    // set initial start end
    if(moment().minutes() % 2 == 0){
      this.start = moment().startOf('minute');
    } else {
      this.start =  moment().startOf('minute').subtract(1,'m');
    }
    this.end = this.start.clone().add(2, 'm'); 

   // console.log('Start',this.start);
   // console.log('End',this.end);

    // set start end every 2 mins 
    debugSchedule = later.parse.text('every 2 min');
    t = later.setInterval(setStartEnd.bind(this), debugSchedule);
    function setStartEnd(){
      this.start = moment().startOf('minute');
      this.end = moment().startOf('minute').add(2, 'm'); 
        // console.log('Start',this.start);
        // console.log('End',this.end);
    };
}

module.exports = uncertainTime;