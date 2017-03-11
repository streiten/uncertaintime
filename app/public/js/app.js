(function(window){

    uctApp.prototype.constructor = uctApp;
    uctApp.prototype = {
        uctime: moment(),
        uncertain: false
    };

    function uctApp(){

      // ticking favicon
      document.head || (document.head = document.getElementsByTagName('head')[0]);
      this.faviconSrcs  = [ '/img/white.ico','/img/black.ico' ];

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

        if(this.uctime.second() % 2) {
          if(this.secChanged){
            this.secChanged = 0;
            this.toggleFavicon(this.faviconSrcs[this.secChanged]);
          }
        } else {
          if(!this.secChanged){
            this.secChanged = 1;
            this.toggleFavicon(this.faviconSrcs[this.secChanged]);
          }
        }

        if (this.uct) {
          $(sel).addClass('active');
        } else {
          $(sel).removeClass('active');
        }

        // debug
        if($('body').hasClass('debug')){
          document.getElementById("real-time-string").innerHTML = moment().format(timeformat);
          setPieClock('uncertainty-time-pie-circle', this.uctime.seconds() );
          setPieClock('real-time-pie-circle', moment().seconds() );
        }
    };

    uctApp.prototype.toggleFavicon = function(src) {
     var link = document.createElement('link'),
         oldLink = document.getElementById('dynamic-favicon');
     link.id = 'dynamic-favicon';
     link.rel = 'shortcut icon';
     link.href = src;
     if (oldLink) {
      document.head.removeChild(oldLink);
     }
     document.head.appendChild(link);
    };

    // debug purposes
    function setPieClock ( sel , value ) {
      var done = value / 60 * 100;
      document.getElementById(sel).style.strokeDasharray = done + " 100";
    };

    window.uctApp = uctApp;

}(window));