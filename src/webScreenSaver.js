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

  $['webScreenSaver'] = function(opts){
    config = $.extend({},defaults,opts);

  };
})(window,document,Math,jQuery);
