var winston = require('winston');
var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');
var path = require('path');
var moment = require("moment");

function uncertainTime() {
  
  // reading in the schedule from file
  winston.log('info', "Init schedule... ");

  var scheduleFile = path.join(__dirname,'..', 'schedule.json');
  
  this.schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf8'));
  this.initSchedule();

  winston.log('info', "Current/Next Period Start: " + this.start.format());
  winston.log('info', "Current/Next Period End: " + this.end.format()); 
  winston.log('info', "Period will last about " + this.end.from(this.start,true)); 

  this.uncertainTimePeriodUpdated = true;

  this.debug = false;
  if(this.debug) {
    this.initDebug(2);
  }

  this.uncertain = false;  
  this.timederrivation = 0;
  
  // calculating the time every 100ms
  setInterval(this.updateTime.bind(this),100);

}

uncertainTime.prototype.updateTime = function () {

      var realTime = moment();

      this.updateCurrentPeriod();

      if(this.debug ||  this.uncertain){

        this.time = distortFunction(realTime,this.start,this.end);
        this.timederrivation = Math.round(this.time.diff(realTime) / 1000);

        // console.log('Start',this.start);
        // console.log('End',this.end);
        // console.log('RT  :',realTime);
        // console.log('UT  :',this.time);
        // console.log('DIFF:',this.timederrivation);

      } else {
      
        this.timederrivation = 0; 
        this.time = realTime;
      
      }
};

uncertainTime.prototype.updateCurrentPeriod = function (){

  if(moment().isBetween(this.start, this.end)) {
  
    if(this.uncertainTimePeriodUpdated) {
      winston.log('info', "A uncertainty period started.");
    } else {

    }
      this.uncertainTimePeriodUpdated = false;

    this.uncertain = true;
  
  } else {
    
    winston.log('info', "The uncertainty period ended.");
    this.uncertain = false;

    if(!this.uncertainTimePeriodUpdated) {

      for (var i = this.schedule.uncertainTimes.length - 1; i >= 0; i--) {
        var now = moment();
        // end in past, remove item from schedules array 
        var isPast = this.schedule.uncertainTimes[i].end.isBefore(now);
        if(isPast) {
          this.schedule.uncertainTimes.splice(i,1);
        }
      }
      
      // let's assume 
      // - no overlaps in schedule definition 
      // - chronolgical order 
      // so after removing past ones the first should be the current or next one
      if(this.schedule.uncertainTimes.length > 0) {
        this.start = this.schedule.uncertainTimes[0].start;
        this.end = this.schedule.uncertainTimes[0].end;
      } else {
        // uh no uncertain period coming up...
        throw new Error('Err... no valid uncertain period defined...');
      }

      winston.log('info', "Next Period Start: " + this.start.format());
      winston.log('info', "Next Period End: " + this.end.format()); 
      winston.log('info', "Period will last about " + this.end.from(this.start,true)); 

      this.uncertainTimePeriodUpdated = true;

    }

  }

}

uncertainTime.prototype.initDebug = function(duration) {

    // set initial start end
    var subtractVal = moment().minutes() % duration;

    this.start =  moment().startOf('minute').subtract(subtractVal,'m');
    this.end = this.start.clone().add(duration, 'm'); 

    console.log('Start',this.start);
    console.log('End',this.end);

    // set start end every 2 mins 
    debugSchedule = later.parse.recur().every(duration).minute();
    t = later.setInterval(setStartEnd.bind(this), debugSchedule);
    function setStartEnd(){
      this.start = moment().startOf('minute');
      this.end = moment().startOf('minute').add(duration, 'm'); 
        console.log('Start',this.start);
        console.log('End',this.end);
    };

};


function distortFunction(val,start,end) {
  
  var diff = end.unix() - start.unix();
  var val = val.unix() - start.unix(); 

  // console.log('Val:' + val);
  // console.log('Start:' + start);
  // console.log('End:' + end);
  // console.log('Diff:' + diff);

  var result = easing.easeInOutQuad(val,0,diff,diff);  
  return moment(result * 1000 + start);

}

uncertainTime.prototype.initSchedule = function (){

  for (var i = this.schedule.uncertainTimes.length - 1; i >= 0; i--) {
    
    this.schedule.uncertainTimes[i].start = moment(this.schedule.uncertainTimes[i].start);
    this.schedule.uncertainTimes[i].end = moment(this.schedule.uncertainTimes[i].end);
    var now = moment();

    // end in past, remove item from schedules array 
    var isPast = this.schedule.uncertainTimes[i].end.isBefore(now);
    if(isPast) {
      this.schedule.uncertainTimes.splice(i,1);
    }

  }
  
  // let's assume 
  // - no overlaps in schedule definition 
  // - chronolgical order 
  // so after removing past ones the first should be the current or next one
  if(this.schedule.uncertainTimes.length > 0) {
    this.start = this.schedule.uncertainTimes[0].start;
    this.end = this.schedule.uncertainTimes[0].end;
  } else {
    // uh no uncertain period coming up...
    throw new Error('Err... no valid uncertain period defined...');
  }

};


module.exports = uncertainTime;