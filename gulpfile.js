/*
 * Licensed under the Apache 2 license.
 */


// browserify build config
var buildDir = "build";
var outputFile = "jheatmap";

// packages
var gulp   = require('gulp');

// browser builds
var browserify = require('browserify');
var source = require('vinyl-source-stream'); // converts node streams into vinyl streams

var path = require('path');
var join = path.join;
var mkdirp = require('mkdirp');
var del = require('del');
var chmod = require('gulp-chmod');

var packageConfig = require('./package.json');


// will remove everything in build
gulp.task('clean', function(cb) {
  del([buildDir], cb);
});

// just makes sure that the build dir exists
gulp.task('init', ['clean'], function() {
  mkdirp(buildDir, function (err) {
    if (err) console.error(err)
  });
});

// browserify debug
gulp.task('build-browser',['init'], function() {
  var b = browserify({debug: true,hasExports: true});
  exposeBundles(b);
  return b.bundle()
    .pipe(source(outputFile + ".js"))
    .pipe(chmod(644))
    .pipe(gulp.dest(buildDir));
});

// exposes the main package
// + checks the config whether it should expose other packages
function exposeBundles(b){
  b.add('./index.js', {expose: packageConfig.name });
  if(packageConfig.sniper !== undefined && packageConfig.sniper.exposed !== undefined){
    for(var i=0; i<packageConfig.sniper.exposed.length; i++){
      b.require(packageConfig.sniper.exposed[i]);
    }
  }
}
