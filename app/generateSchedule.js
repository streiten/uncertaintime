var fs = require('fs');
var winston = require('winston');

fs.writeFileSync('./schedule.json',JSON.stringify(generateSchedule(),null,1));

function generateSchedule(){
  
  var days = [];
  
  for (var i = 0; i < 60 ; i++) {
    
    var seconds = [];
    
    for (var j = 0; j < 10 ; j++) {
     val = randomInt(0,60);
     //make sure no doubles
     while(seconds.indexOf(val) > -1 ){
      val = randomInt(0,60);
     }
     seconds[j] = val;
    }

    seconds.sort(sortNumber);

    days[i] = { "m":[i], "s" : seconds };
  
  }
  
  var schedule = { "schedules" : days };
  
  return schedule;  
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function sortNumber(a,b) {
    return a - b;
}
