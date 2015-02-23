'use strict';

var babel = require('gulp-babel'),
    gulp  = require('gulp');

gulp.task('babel', function() {
  return (
    gulp.src('./src/generators/**/*.js')
      .pipe(babel())
      .pipe(gulp.dest('./generators'))
  );
});
