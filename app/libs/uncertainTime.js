var winston = require('winston');
var fs = require('fs');
var later = require('later');
var easing = require('easing-js');
var util = require('util');
var path = require('path');
var moment = require("moment");

var EventEmitter = require('events').EventEmitter;
util.inherits(uncertainTime, EventEmitter);

function uncertainTime() {
  
  // reading in the schedule from file
  winston.log('info', "Init schedule... ");

  this.debug = false;

  if(this.debug) {
   
    this.initDebug(2);
  
  } else {

    // var scheduleFile = path.join(__dirname,'..', 'schedule.json');
    // this.schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf8'));
    // this.initSchedule();

    this.start =  moment().startOf('minute');
    this.end = this.start.clone().add(1, 'm'); 

    winston.log('info', "Current/Next Period Start: " + this.start.format());
    winston.log('info', "Current/Next Period End: " + this.end.format()); 
    winston.log('info', "Period will last about " + this.end.from(this.start,true)); 

  }
  
  this.refreshStartEnd = false;
  this.uncertain = false;  
  this.timederrivation = 0;
  this.distortFunction = 0;

  // calculating the time every 100ms
  setInterval(this.updateTime.bind(this),100);

}

uncertainTime.prototype.updateTime = function () {

      var realTime = moment();

      if(!this.debug) {
        this.checkSchedule();
      }

      if(this.debug ||  this.uncertain){

        this.time = distortTime(realTime,this.start,this.end,this.distortFunction);
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

uncertainTime.prototype.checkSchedule = function (){

  if(moment().isBetween(this.start, this.end)) {
  
    if(!this.uncertain) {
      this.emit('uncertainPeriodChanged','start');
      
      this.uncertain = true;
    } 
  
  } else {
    
    if(this.uncertain) {
      this.emit('uncertainPeriodChanged','end');
      
      this.refreshStartEnd = true;
      this.uncertain = false;
    }

    if(this.refreshStartEnd) {

      this.generateUncertainPeriod();

      // for (var i = this.schedule.uncertainTimes.length - 1; i >= 0; i--) {
      //   var now = moment();
      //   // end in past, remove item from schedules array 
      //   var isPast = this.schedule.uncertainTimes[i].end.isBefore(now);
      //   if(isPast) {
      //     this.schedule.uncertainTimes.splice(i,1);
      //   }
      // }
      
      // // let's assume 
      // // - no overlaps in schedule definition 
      // // - chronolgical order 
      // // so after removing past ones the first should be the current or next one
      // if(this.schedule.uncertainTimes.length > 0) {
      //   this.start = this.schedule.uncertainTimes[0].start;
      //   this.end = this.schedule.uncertainTimes[0].end;
      // } else {
      //   // uh no uncertain period coming up...
      //   throw new Error('Err... no valid uncertain period defined...');
      // }

      winston.log('info', "Next Period Start: " + this.start.format());
      winston.log('info', "Next Period End: " + this.end.format()); 
      winston.log('info', "Period will last about " + this.end.from(this.start,true)); 

      this.refreshStartEnd = false;

    }

  }

}

uncertainTime.prototype.initDebug = function(duration) {

    // set initial start end
    var subtractVal = moment().minutes() % duration;

    this.start =  moment().startOf('minute').subtract(subtractVal,'m');
    this.end = this.start.clone().add(duration, 'm'); 

    winston.log('info', "Debug Start: " + this.start.format());
    winston.log('info', "Debug End: " + this.end.format()); 

    // set start end every 2 mins 
    debugSchedule = later.parse.recur().every(duration).minute();
    t = later.setInterval(setStartEnd.bind(this), debugSchedule);
    function setStartEnd(){
      this.start = moment().startOf('minute');
      this.end = moment().startOf('minute').add(duration, 'm'); 
        winston.log('info', "Debug Start: " + this.start.format());
        winston.log('info', "Debug End: " + this.end.format()); 
    };

};


function distortTime(val,start,end,type) {
  
  var diff = end.unix() - start.unix();
  var val = val.unix() - start.unix(); 

  // console.log('Val:' + val);
  // console.log('Start:' + start);
  // console.log('End:' + end);
  // console.log('Diff:' + diff);

  switch(type) {
    case 0:
      var result = easing.easeInOutBack(val,0,diff,diff);
    break; 
    
    case 1:
      var result = 0;
    break; 

    case 3:
      var result = easing.easeInOutExpo(val,0,diff,diff);
    break; 

  }

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

uncertainTime.prototype.generateUncertainPeriod = function (){
    
    // new duration between 5 mins and 5 hours 
    var durationMins = randomInt(5,300);
    // var durationMins = randomInt(1,5);

    // how long till next start between 6 and 24 hours
    var delayMins = randomInt( 6 * 60 , 24 * 60);
    // var delayMins = randomInt(1 , 5);

    this.start =  moment(this.end).add(delayMins,'m');
    this.end = this.start.clone().add(durationMins, 'm'); 

    this.distortFunction = randomInt(0,2);

};

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = uncertainTime;