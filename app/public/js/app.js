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

      this.appVue = new Vue({
        el: '.app-wrap',
        data: {
            time: '',
            uctActive: false,
            overlayActive: false,
            periodStart : '',
            periodEnd : '',
            clientTime : ''
        },
        methods : {
            showOverlay: function (){
                this.overlayActive = true;
            },
            hideOverlay: function (){
                this.overlayActive = false;
            }
        }
      });

      // for debug purpose
      this.getPeriod();

      // bring links to front with z-index instead ?
      $('.overlay a').bind('click',function(e){
            e.stopPropagation();
      });

    }

    uctApp.prototype.init = function(){
    };

    uctApp.prototype.welcomeHandler = function(msg){
      console.log(msg);
    };

    uctApp.prototype.timeHandler = function(msg){

        ref.uctime = moment(msg.value);
        ref.uncertain = msg.uct;
        
        //console.log(msg.value.toString());
        //console.log(ref.uctime.local().format());

        var timeformat = "H:mm:ss";
        ref.appVue.time = ref.uctime.format(timeformat);
        ref.appVue.isActive = ref.uncertain;
        ref.appVue.clientTime = moment().format(timeformat);

        if($('body').hasClass('debug')){
            setPieClock('uncertainty-time-pie-circle', ref.uctime.seconds() );
            setPieClock('real-time-pie-circle', moment().seconds() );
        }

    };

    uctApp.prototype.periodHandler = function(msg){
        ref.appVue.periodStart  = moment(msg.start).format();
        ref.appVue.periodEnd = moment(msg.end).format();
    };
    
    uctApp.prototype.getUncertime = function(){
      this.socket.emit('gettime');
    };

    uctApp.prototype.getPeriod = function(){
      this.socket.emit('getperiod');
    };


    // debug pies
    function setPieClock ( el , value ) {
      var done = value / 60 * 100;
      document.getElementById(el).style.strokeDasharray = done + " 100";
    };

    window.uctApp = uctApp;

}(window));