;(function(window,document,Math,$,undefined){
  var defaults = {
    configPath: '.',
    videos: [],
    videoDuration: -1,
  };

  var config = {};

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
      setVideo: function(url){
        var src = $("<source></source>",{
          type: "video/webm",
          src: url
        });
        this.$.html(src);
      },
    };

    return vidCon;
  };

  $['webScreenSaver'] = function(opts){
    config = $.extend({},defaults,opts);
    var test = newVidCon();
    $('body').append(test.$);

    test.setVideo("http://screensaver.justinlam.ca/res/london-night.webm");
  };
})(window,document,Math,jQuery);
