;(function(window,document,Math,$,undefined) {
  'use strict';

var defaults = {
  videos: [],
  videoDuration: -1,
  interval: 2*60*1000,
  stagnantDelay: 5000,
  stagnantTrigger: true,
  target: $('body'),
  triggerKeycode: 32,
  nextVidKeycode: 39,
};
var config = {};
var currentVid = null;
var stagnantTimeout = null;
var isRunning = false;

var util = {
  randomInt:function(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }
};

var newVidCon = function(){
  var vidCon = {
    target: config.target,
    transitionDuration: 1000,
    $:null,
    setVideo: function(vidSrcObj){
      var fragment = document.createDocumentFragment();
      var extKeys = Object.keys(vidSrcObj);

      for(var i = 0; i < extKeys.length; i++){
        (function(index){
          var ext = extKeys[index];
          var src = $("<source></source>",{
            type: "video/"+ext,
            src: vidSrcObj[ext]
          });
          fragment.appendChild(src[0]);
        })(i);
      }
      this.$.html(fragment);
    },
    fadeIn: function(){
      var obj = this;
      var def = $.Deferred();

      this.$.on('loadeddata',function(){
        obj.$.animate({
          opacity: 1
        },obj.transitionDuration,function(){
          def.resolve();
        });
      });
      this.target.append(this.$);

      return def.promise();
    },
    fadeOut: function(){
      var obj = this;
      var def = $.Deferred();

      this.$.animate({
        opacity: 0
      },this.transitionDuration,function(){
        obj.$.remove();
        def.resolve();
      });

      return def.promise();
    }
  };

  if(vidCon.target.prop('tagName').toLowerCase() === 'body'){
    vidCon.$ = $("<video></video>",{
      style: "width: auto;height: auto;position: fixed;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);opacity:0;",
      class: 'vidcon',
      autoplay: 'autoplay'
    });
  } else{
    var height = vidCon.target.outerWidth() >= vidCon.target.outerHeight()?'100%':'auto';
    var width = height === 'auto'?'100%':'auto';
    vidCon.$ = $("<video></video>",{
      style: "width: "+width+";height: "+height+";position: absolute;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);opacity:0;",
      class: 'vidcon',
      autoplay: 'autoplay'
    });
  }

  return vidCon;
};

var toggleVideos = function(){
  var def = $.Deferred();
  var randIndex = util.randomInt(0,config.videos.length-1);
  var vidSrc = config.videos[randIndex];

  var tmpVid = newVidCon();
  tmpVid.setVideo(vidSrc);
  tmpVid.fadeIn().then(function(){
    if(currentVid){
      currentVid.fadeOut();
    }
    currentVid = tmpVid;
    def.resolve(currentVid);
  });

  return def.promise();
};

var startSaver = function(){
  isRunning = true;
  toggleVideos().then(function(newVid){
    var durMilli = (newVid.$[0].duration - newVid.$[0].currentTime)*1000;
    var timeout = durMilli < config.interval? durMilli:config.interval;
    timeout = timeout - 5000;
    setTimeout(function(){
      if(isRunning){
        startSaver();
      }
    },timeout);
  });
};

var stopSaver = function(){
  isRunning = false;
  if(currentVid){
    currentVid.$.remove();
    currentVid = null;
  }
};

var startWindowMonitor = function(){
  stagnantTimeout = setTimeout(function(){
    startSaver();
  },config.stagnantDelay);

  $(window).on('click mousemove mousedown keydown',function(){
    window.clearTimeout(stagnantTimeout);
    stopSaver();
    stagnantTimeout = setTimeout(function(){
      startSaver();
    },config.stagnantDelay);
  });
};

var startControlMonitor = function(){
  $(window).on('keydown',function(e){
    var keycode = e.which;
    if(keycode === config.triggerKeycode){//space
      if(!currentVid){
        startSaver();
      } else{
        stopSaver();
      }
    } else if(keycode === config.nextVidKeycode && currentVid){//right
      toggleVideos();
    }
  });
};

$['webScreenSaver'] = function(opts){
  config = $.extend({},defaults,opts);

  if(!config.videos || config.videos.length <= 0){
    throw "ERROR: No videos provided.";
  }

  stagnantTimeout = null;
  if(config.stagnantTrigger){
    startWindowMonitor();
  } else{
    startControlMonitor();
  }

  return this;
};

$.fn.webScreenSaver = function(opts){
  config = $.extend({},defaults,opts);
  config.target = this;
  $(this).css('overflow','hidden');
  if($(this).css('position') === 'static'){
    $(this).css('position','relative');
  }

  if(!config.videos || config.videos.length <= 0){
    throw "ERROR: No videos provided.";
  }

  stagnantTimeout = null;
  if(config.stagnantTrigger){
    startWindowMonitor();
  } else{
    startControlMonitor();
  }

  return this;
};

})(window,document,Math,jQuery);
