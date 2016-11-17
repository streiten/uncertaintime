var socket = io();

socket.on('welcome', function(msg){
  console.log(msg);
});

socket.on('time', function(msg){
  updateClocks(msg);
});

function updateClocks( msg ) {
  
  var uncertainTime = new Date(msg.value);
  var uctString = document.getElementById("uncertain-time");
  uctString.innerHTML = uncertainTime.toLocaleTimeString();
  
  var time = new Date();
  // document.getElementById("real-time").innerHTML = time.toLocaleTimeString();

  switch(msg.unit) {
    case 's':
      setPieClock('uncertainty-time-pie-circle', uncertainTime.getSeconds() );
      setPieClock('real-time-pie-circle', time.getSeconds() );
    break; 
    
    case 'm':
      setPieClock('uncertainty-time-pie-circle', uncertainTime.getMinutes() );
      setPieClock('real-time-pie-circle', time.getMinutes() );
    break;
  }

  if (msg.uct) {
    console.log("the time");
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