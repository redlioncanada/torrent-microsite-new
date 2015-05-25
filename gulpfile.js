var gulp = require("gulp"),
	babel = require("gulp-babel"),
	stripDebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
    minifyHtml = require('gulp-minify-html'),
	minifyCss = require('gulp-minify-css'),
    reload = require('gulp-livereload'),
    plugins = require('gulp-load-plugins')(),
    sourcemaps = require('gulp-sourcemaps'),
    babeloptions = {
        compact: false
    };

gulp.task("default", function() {
    plugins.livereload.listen();
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/less/**/*.less', ['css']);
    gulp.watch('src/**/*.html', ['html']);
});

gulp.task("production", function() {
    gulp.watch('src/js/**/*.js', ['jsmin']);
    gulp.watch('src/less/**/*.less', ['cssmin']);
    gulp.watch('src/**/*.html', ['htmlmin']);
});

gulp.task("html", function() {
    return gulp.src("src/**/*.html")
        .pipe(gulp.dest("debug"))
        .pipe(plugins.livereload());
});

gulp.task("js", function () {
    var b = babel(babeloptions);
    b.on('error',function(){console.log('error parsing js');b.end()});
  return gulp.src("src/js/**/*.js")
    .pipe(b)
    .pipe(gulp.dest("debug/js"))
    .pipe(plugins.livereload());
});

gulp.task("css", function() {
	return gulp.src("src/less/**/*.less")
		.pipe(less())
		.pipe(gulp.dest("debug/css"))
        .pipe(plugins.livereload());
});

gulp.task("htmlmin", function() {
    return gulp.src("src/**/*.html")
        .pipe(minifyHtml())
        .pipe(gulp.dest("."))
});

gulp.task("jsmin", function () {
    var b = babel(babeloptions);
    b.on('error',function(){console.log('error parsing js');b.end()});
  return gulp.src("src/js/**/*.js")
    .pipe(b)
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest("js"));
});

gulp.task("cssmin", function() {
    return gulp.src("src/less/**/*.less")
        .pipe(less())
        .pipe(minifyCss())
        .pipe(gulp.dest("css"));
});