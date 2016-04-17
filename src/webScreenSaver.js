;(function(window,document,Math,$,undefined){
  var defaults = {
    videos: [],
    videoDuration: -1,
    interval: 2*60*1000,
    stagnantDelay: 5000,
    stagnantTrigger: true
  };
  var config = {};
  var layer1 = null;
  var layer2 = null;
  var stagnantTimeout = null;

  var util = {
    randomInt:function(min,max){
      return Math.floor(Math.random()*(max-min+1)+min);
    }
  };

  var newVidCon = function(){
    var vidCon = {
      $:$("<video></video>",{
        style: "min-width:100%;min-height:100%;width: auto;height: auto;position: fixed;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);",
        class: 'vidcon',
        autoplay: 'autoplay'
      }),
      setVideo: function(vidSrcObj){
        var fragment = document.createDocumentFragment();
        var extKeys = Object.keys(vidSrcObj);

        var src = $("<source></source>",{
          type: "video/webm",
          src: url
        });
        this.$.html(src);
      },
    };

    return vidCon;
  };

  var toggleVideos = function(){
    console.log('> toggling');
  };

  var startRotation = function(){
    console.log('> hrmm');
  };

  var startWindowMonitor = function(){
    stagnantTimeout = setTimeout(function(){
      startRotation();
    },config.stagnantDelay);

    $(window).on('click mousemove mousedown keydown',function(){
      window.clearTimeout(stagnantTimeout);
      stagnantTimeout = setTimeout(function(){
        startRotation();
      },config.stagnantDelay);
    });
  };




  $['webScreenSaver'] = function(opts){
    config = $.extend({},defaults,opts);
    layer1 = newVidCon();
    layer2 = newVidCon();

    stagnantTimeout = null;
    if(config.stagnantTrigger){
      startWindowMonitor();
    }


    //$('body').append(test.$);
    //test.setVideo("http://screensaver.justinlam.ca/res/london-night.webm");

    return this;
  };

})(window,document,Math,jQuery);