var DEFAULTS = {
  videos: [],
  videoDuration: -1,
  interval: 2*60*1000,
  stagnantDelay: 5000,
  stagnantTrigger: true,
  target: document.querySelector('body'),
  triggerKeycode: 32,
  nextVidKeycode: 39,
};

var util = {
  randomInt:function(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }
};

var Deferred = (function(){
  Promise.settle = function(promisesArr){
    var reflectedArr = promisesArr.map(function(promise){
      return promise.then(function(successResult){
        return {
          result: successResult,
          status: 'resolved'
        };
      },function(errorResult){
        return {
          result: errorResult,
          status: 'rejected'
        };
      });
    });
    return Promise.all(reflectedArr);
  };
  
  var Deferred = function(){
    var def = this;
    this.promise = new Promise(function(resolve,reject){
      def.resolve = resolve;
      def.reject = reject;
    });

    this.then = this.promise.then.bind(this.promise);
    this.catch = this.promise.catch.bind(this.promise);
  };

  return Deferred;
})();

var extend = (function(){
  function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object';

    return nonNullObject && Object.prototype.toString.call(val) !== '[object RegExp]' && Object.prototype.toString.call(val) !== '[object Date]';
  }

  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }

  function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true;
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
  }

  function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice();
    source.forEach(function (e, i) {
      if (typeof destination[i] === 'undefined') {
        destination[i] = cloneIfNecessary(e, optionsArgument);
      } else if (isMergeableObject(e)) {
        destination[i] = deepmerge(target[i], e, optionsArgument);
      } else if (target.indexOf(e) === -1) {
        destination.push(cloneIfNecessary(e, optionsArgument));
      }
    });
    return destination;
  }

  function mergeObject(target, source, optionsArgument) {
    var destination = optionsArgument && optionsArgument.mutate? target:{};
    if (isMergeableObject(target)) {
      Object.keys(target).forEach(function (key) {
        destination[key] = cloneIfNecessary(target[key], optionsArgument);
      });
    }
    Object.keys(source).forEach(function (key) {
      if (!isMergeableObject(source[key]) || !target[key]) {
        destination[key] = cloneIfNecessary(source[key], optionsArgument);
      } else {
        destination[key] = deepmerge(target[key], source[key], optionsArgument);
      }
    });
    return destination;
  }

  function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge };
    var arrayMerge = options.arrayMerge || defaultArrayMerge;

    if (array) {
      return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
    } else {
      return mergeObject(target, source, optionsArgument);
    }
  }

  deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
      throw new Error('first argument should be an array with at least two elements');
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, optionsArgument);
    });
  };

  return deepmerge;
})();

var VidCon = (function(){
  function VidCon(target){
    this.target = target;
    this.transitionDuration = 1000;
    
    this.$ = document.createElement('video');
    this.$.setAttribute('class','vidcon');
    this.$.setAttribute('autoplay','autoplay');
    this.$.muted = true;
    
    if(this.target.tagName.toLowerCase() === 'body'){
      this.$.setAttribute('style','width: auto;height: auto;position: fixed;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);opacity:0;transition: opacity 1s linear;');
    } else{
      var boundingRect = this.target.getBoundingClientRect();
      var height = boundingRect.width >= boundingRect.height?'100%':'auto';
      var width = height === 'auto'?'100%':'auto';
      this.$.setAttribute('style','width: '+width+';height: '+height+';position: absolute;top: 50%;left: 50%;transform: translate3d(-50%,-50%,0);opacity:0;transition: opacity 1s linear;');
    }
  }

  VidCon.prototype.setVideo = function(vidSrcObj){
    var fragment = document.createDocumentFragment();
    var extKeys = Object.keys(vidSrcObj);

    for(var i = 0; i < extKeys.length; i++){
      (function(index){
        var ext = extKeys[index];
        var src = document.createElement('source');
        src.setAttribute('type', 'video/'+ext);
        src.setAttribute('src', vidSrcObj[ext]);
        fragment.appendChild(src);
      })(i);
    }
    this.$.innerHTML = '';
    this.$.appendChild(fragment);
  };

  VidCon.prototype.fadeIn = function(){
    var obj = this;
    var def = new Deferred();

    this.$.addEventListener('loadeddata',function(){
      obj.$.style.opacity = 1;
      setTimeout(function(){
        def.resolve();
      }, this.transitionDuration);
    });
    this.target.appendChild(this.$);

    return def.promise;
  };

  VidCon.prototype.fadeOut = function(){
    var obj = this;
    var def = new Deferred();

    obj.$.style.opacity = 0;
    setTimeout(function(){
      obj.target.removeChild(obj.$);
      def.resolve();
    }, this.transitionDuration);

    return def.promise;
  };

  return VidCon;
})();

function WebScreensaver(opts){
  this.config = extend(DEFAULTS,opts);
  this.target = opts.target || DEFAULTS.target;
  this.currentVid = null;
  this.stagnantTimeout = null;
  this.isRunning = false;
  this.setTargetStyle();

  if(!this.config.videos || this.config.videos.length <= 0){
    throw "Error: No videos provided.";
  }

  if(this.config.stagnantTrigger){
    this.startWindowMonitor();
  } else{
    this.startControlMonitor();
  }
}

WebScreensaver.prototype.setTargetStyle = function(){
  if(this.target !== DEFAULTS.target){
    this.target.style.overflow = 'hidden';
    if(this.target.style.position === 'static'){
      this.target.style.position = 'relative';
    }
  }
};

WebScreensaver.prototype.startSaver = function(){
  var saver = this;
  this.isRunning = true;
  this.toggleVideos().then(function(newVid){
    var durMilli = (newVid.$.duration - newVid.$.currentTime)*1000;
    var timeout = durMilli < saver.config.interval? durMilli:saver.config.interval;
    timeout = timeout - 5000;
    setTimeout(function(){
      if(saver.isRunning){
        saver.startSaver();
      }
    },timeout);
  });
};

WebScreensaver.prototype.stopSaver = function(){
  this.isRunning = false;
  if(this.currentVid){
    this.target.removeChild(this.currentVid.$);
    this.currentVid = null;
  }
};

WebScreensaver.prototype.toggleVideos = function(){
  var def = new Deferred();
  var saver = this;
  var randIndex = util.randomInt(0,this.config.videos.length-1);
  var vidSrc = this.config.videos[randIndex];

  var tmpVid = new VidCon(this.target);
  tmpVid.setVideo(vidSrc);
  tmpVid.fadeIn().then(function(){
    if(saver.currentVid){
      saver.currentVid.fadeOut();
    }
    saver.currentVid = tmpVid;
    def.resolve(saver.currentVid);
  });

  return def.promise;
};

WebScreensaver.prototype.startWindowMonitor = function(){
  var saver = this;
  this.stagnantTimeout = setTimeout(function(){
    saver.startSaver();
  },this.config.stagnantDelay);

  var deactivate = function(){
    window.clearTimeout(saver.stagnantTimeout);
    saver.stopSaver();
    saver.stagnantTimeout = setTimeout(function(){
      saver.startSaver();
    },saver.config.stagnantDelay);
  };

  window.addEventListener('click', deactivate);
  window.addEventListener('mousemove', deactivate);
  window.addEventListener('mousedown', deactivate);
  window.addEventListener('keydown', deactivate);
};

WebScreensaver.prototype.startControlMonitor = function(){
  var saver = this;
  window.addEventListener('keydown', function(e){
    var keycode = e.which;
    if(keycode === saver.config.triggerKeycode){//space
      if(!saver.currentVid){
        saver.startSaver();
      } else{
        saver.stopSaver();
      }
    } else if(keycode === saver.config.nextVidKeycode && saver.currentVid){//right
      saver.toggleVideos();
    }
  });
};


window.WebScreensaver = WebScreensaver;