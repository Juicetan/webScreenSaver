var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var es = require('event-stream');
var runSync = require('run-sequence');
var browserSync = require('browser-sync').create();

var paths = {
  startCode: './src/pluginStart.js',
  endCode: './src/pluginEnd.js',
  testPage: './test.html',
  workingDir: './',
  buildDir: './.tmp/',
  builtDir: './dist/',
  scripts: 'src/webScreenSaver.js',
  updatePath: './dist/**/*.html'
};

var pluginName = "webScreenSaver.js";
var pluginMinifiedName = "webScreenSaver.min.js";

var startLiveReloadServer = function(){
  browserSync.init({
    open: false,
    server: {
      baseDir: 'dist'
    }
  });
  console.log("> started live reload server");
};

var changeDetected = function(file){
  console.log('> change detected',file);

  runSync('combine',function(){
    browserSync.reload();
  });
};

gulp.task('clean',function(){
  return es.concat(
    gulp.src(paths.buildDir).pipe(clean()),
    gulp.src(paths.builtDir).pipe(clean())
  );
});

gulp.task('combine', function(){
  var codePaths = [paths.startCode, paths.scripts, paths.endCode];

  return es.concat(
    gulp.src(codePaths)
      .pipe(concat(pluginMinifiedName))
      .pipe(uglify({
        mangle: {
          reserved: ['WebScreensaver','VidCon']
        }
      }))
      .pipe(gulp.dest(paths.builtDir)),
    gulp.src(codePaths)
      .pipe(concat(pluginName))
      .pipe(gulp.dest(paths.builtDir)),
    gulp.src(paths.testPage)
      .pipe(rename('index.html'))
      .pipe(gulp.dest(paths.builtDir))
  );
});

gulp.task('watchChanges',function(){
  startLiveReloadServer();

  gulp.watch(paths.workingDir+paths.scripts,changeDetected);
  gulp.watch(paths.testPage,changeDetected);
});

gulp.task('serve',function(callback){
  runSync('clean', 'combine', 'watchChanges' ,callback);
});
