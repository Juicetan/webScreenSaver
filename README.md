# webScreenSaver
A jQuery plugin to create a video screensaver experience within the browser.

This plugin can be used to enable a rotating video screensaver after a specified duration since the last detection of user activity.  By default the screensaver will fade in a random video from a specified set defined during initialization that will encompass the entire browser window.  Alternatively the plugin can be initialized on a particular `<div/>` and will feature screensaver functionality within said `<div/>`.  The option also exists to control the rotating screensaver via manual keyboard shortcuts.

##Getting Started

1. Fetch the plugin

  ```shell
  $ npm install webScreenSaver
  ```

2. Include the plugin

  ```html
  <script src="node_modules/webScreenSaver/dist/webScreenSaver.js"></script>
  ```

3. Initialize

  Full Browser:
  ```javascript
  $.webScreenSaver({
    stagnantTrigger: false,
    videos: [{
      webm: '//video.webm',
      mp4: '//video.mp4'
    },
    ...
  });
  ```
  `DIV` Contained:
  ```javascript
  $('.vid-wrap').webScreenSaver({
    stagnantTrigger: false,
    videos: [{
      webm: '//video.webm',
      mp4: '//video.mp4'
    },
    ...
  });
  ```
