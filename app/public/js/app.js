var socket = io();

socket.on('welcome', function(msg){
  console.log(msg);
});

socket.on('time', function(msg){
  updateClocks(msg);
});


// emit time to web clients every secont
function getUncertime() { 
  socket.emit('gettime');
}
setInterval(getUncertime,100);


function updateClocks( msg ) {
  
  var uncertainTime = moment(msg.value);
  var timeformat = "H:mm:ss";
  var uctString = document.getElementById("uncertain-time");
  
  uctString.innerHTML = uncertainTime.format(timeformat); 
  
  var time = moment();
  document.getElementById("real-time").innerHTML = time.format(timeformat);

  switch(msg.unit) {
    case 's':
      setPieClock('uncertainty-time-pie-circle', uncertainTime.seconds() );
      setPieClock('real-time-pie-circle', time.seconds() );
    break; 
    
    case 'm':
      setPieClock('uncertainty-time-pie-circle', uncertainTime.minutes() );
      setPieClock('real-time-pie-circle', time.minutes() );
    break;
  }

  if (msg.uct) {
    //console.log("the time");
    uctString.className = 'active';
  } else {
    console.log("not the time");
    uctString.className = '';
  }

} 

function setPieClock( selector , value ) {
  var done = value / 60 * 100;
  document.getElementById(selector).style.strokeDasharray = done + " 100";
}