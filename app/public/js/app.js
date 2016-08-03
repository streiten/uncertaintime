var socket = io();

socket.on('welcome', function(msg){
  console.log(msg);
});

socket.on('time', function(msg){

  var uncertainDate = new Date(msg);
  var date = new Date();
  
  document.getElementById("uncertainty-time").innerHTML = uncertainDate.toLocaleTimeString();

  var done = uncertainDate.getSeconds() / 60 * 100;
  var DashArrayStr = done + " 100";
  document.getElementById("uncertainty-time-pie-circle").style.strokeDasharray = DashArrayStr;

  document.getElementById("real-time").innerHTML = date.toLocaleTimeString();
  done = date.getSeconds() / 60 * 100;
  DashArrayStr = done + " 100";

  document.getElementById("real-time-pie-circle").style.strokeDasharray = DashArrayStr;

});