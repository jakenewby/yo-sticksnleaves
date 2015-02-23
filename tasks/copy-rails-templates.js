'use strict';

var gulp = require('gulp');

gulp.task('copyRailsTemplates', function() {
  gulp.src('./src/generators/rails/templates/*')
    .pipe(gulp.dest('./generators/rails/templates'));
});
