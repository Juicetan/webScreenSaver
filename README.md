# webScreenSaver
A jQuery plugin to create a video screensaver experience within the browser.

This plugin can be used to enable a rotating video screensaver after a specified duration since the last detection of user activity.  By default the screensaver will fade in a random video from a specified set defined during initialization that will encompass the entire browser window.  Alternatively the plugin can be initialized on a particular `<div/>` and will feature screensaver functionality within said `<div/>`.  The option also exists to control the rotating screensaver via manual keyboard shortcuts.

<a href="https://nodei.co/npm/webscreensaver/"><img src="https://nodei.co/npm/webscreensaver.png?downloads=true&downloadRank=true&stars=true"></a>

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

##Options
| Name | Example | Description |
| ---- | ------- | ----------- |
| videos | `[{mp4:'//abc.com/video.mp4',webm:'//abc.com/video.webm'}]` | An array of video objects containing a key value mapping of file type and file URL |
| stagnantTrigger | `true` | Flag indicating if the screensaver will activate based on the absence of user activity on the page. |
| stagnantDelay | `5000` | Time in milliseconds of user inactivity before screensaver will trigger if `stagnantTrigger` is `true`. |
| interval | `120000` | Time in milliseconds each video should play for before switching to the next video in the provided `videos` array. If the actual video duration is shorter than the specified interval then the actual video length will be the interval length. |
| triggerKeycode | `32` | Keycode of the keyboard key that will trigger the start and stop of the screensaver.  Default is the spacebar indicated by keycode `32` |
| nextVidKeycode | `39` | Keycode of the the keyboard key that will trigger the switch to the next video of the screensaver.  Default is the right arrow key indicated by the keycode `39` |
