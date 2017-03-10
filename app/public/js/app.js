(function(window){

    uctApp.prototype.constructor = uctApp;
    uctApp.prototype = {
        uctime: moment(),
        uncertain: false
    };

    function uctApp(){

      ref = this;
      this.socket = io();

      this.socket.on('welcome', this.welcomeHandler);
      this.socket.on('time', this.timeHandler);
      this.socket.on('period', this.periodHandler);

      setInterval(this.getUncertime.bind(this),100);

    }

    uctApp.prototype.init = function(){
    };

    uctApp.prototype.welcomeHandler = function(msg){
      console.log(msg);
    };

    uctApp.prototype.timeHandler = function(msg){
      ref.uctime = moment(msg.value);
      ref.uncertain = msg.uct; 

      ref.updateClock('#uncertain-time-string');

    };

    uctApp.prototype.periodHandler = function(msg){
      document.getElementById("period-start").innerHTML = msg.start;
      document.getElementById("period-end").innerHTML = msg.end;
    };
    
    uctApp.prototype.getUncertime = function(){
      this.socket.emit('gettime');
    };

    uctApp.prototype.getPeriod = function(){
      this.socket.emit('getperiod');
    };

    uctApp.prototype.updateClock = function (sel) {
        
        var timeformat = "H:mm:ss";
        $(sel).html(this.uctime.format(timeformat)); 
          
        if (this.uct) {
          //console.log("the time is on!");
          $(sel).addClass('active');
        } else {
          //console.log("not the time");
          $(sel).removeClass('active');
        }

        // debug
        if($('body').hasClass('debug')){
          document.getElementById("real-time-string").innerHTML = moment().format(timeformat);
          setPieClock('uncertainty-time-pie-circle', this.uctime.seconds() );
          setPieClock('real-time-pie-circle', moment().seconds() );
        }
    };

    // debug purposes
    function setPieClock ( sel , value ) {
      var done = value / 60 * 100;
      document.getElementById(sel).style.strokeDasharray = done + " 100";
    };

    window.uctApp = uctApp;

}(window));