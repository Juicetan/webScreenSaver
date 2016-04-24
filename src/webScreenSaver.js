;(function(window,document,Math,$,undefined){
  var defaults = {
    videos: [],
    videoDuration: -1,
    interval: 2*60*1000,
    stagnantDelay: 5000,
    stagnantTrigger: true
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
      target: $('body'),
      transitionDuration: 1000,
      $:$("<video></video>",{
        style: "min-width:100%;min-height:100%;width: auto;height: auto;position: fixed;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);opacity:0;",
        class: 'vidcon',
        autoplay: 'autoplay'
      }),
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
        var def = $.Deferred();

        this.target.append(this.$);
        this.$.animate({
          opacity: 1
        },this.transitionDuration,function(){
          def.resolve();
        });

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

    return vidCon;
  };

  var toggleVideos = function(){
    var def = $.Deferred();
    var randIndex = util.randomInt(0,config.videos.length-1);
    var vidSrc = config.videos[randIndex];

    var tmpVid = newVidCon();
    tmpVid.setVideo(vidSrc);
    tmpVid.fadeIn().then(function(){
      currentVid = tmpVid;
      def.resolve(currentVid);
    });
    if(currentVid){
      currentVid.fadeOut();
    }

    return def.promise();
  };

  var startSaver = function(){
    isRunning = true;
    toggleVideos().then(function(newVid){

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

  $['webScreenSaver'] = function(opts){
    config = $.extend({},defaults,opts);

    stagnantTimeout = null;
    if(config.stagnantTrigger){
      startWindowMonitor();
    }

    return this;
  };

})(window,document,Math,jQuery);
