var gulp = require('gulp');
var clean = require('del');
var uglifyjs = require('uglify-js');
var gulpUglify = require('gulp-uglify/composer');
var uglify = gulpUglify(uglifyjs);
var concat = require('gulp-concat');
var rename = require('gulp-rename');
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

  gulp.series(gulp.task('combine'))(function(){
    browserSync.reload();
  });
};

gulp.task('clean',function(){
  return clean([
    paths.buildDir,
    paths.buildDir
  ]);
});

const codePaths = [paths.startCode, paths.scripts, paths.endCode];
gulp.task('combine', gulp.parallel(
  function(){
    return gulp.src(codePaths)
      .pipe(concat(pluginMinifiedName))
      .pipe(uglify({
        mangle: {
          reserved: ['WebScreensaver','VidCon']
        }
      }))
      .pipe(gulp.dest(paths.builtDir))
  },
  function(){
    return gulp.src(codePaths)
      .pipe(concat(pluginName))
      .pipe(gulp.dest(paths.builtDir))
  },
  function(){
    return gulp.src(paths.testPage)
      .pipe(rename('index.html'))
      .pipe(gulp.dest(paths.builtDir))
  }
));

gulp.task('watchChanges',function(){
  startLiveReloadServer();

  gulp.watch(paths.workingDir+paths.scripts).on('change', changeDetected);
  gulp.watch(paths.testPage).on('change', changeDetected);
});

gulp.task('dev', gulp.series(
  gulp.task('clean'),
  gulp.task('combine'),
  gulp.task('watchChanges')
));