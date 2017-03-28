var gulp = require('gulp');
var typescript = require('gulp-tsc');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var order = require("gulp-order");

var SRC_ROOT = './src',
	TS_SRC = [
		SRC_ROOT + '/references.ts',
		SRC_ROOT + '/main.ts'
		// Add other files to compile here
	],

	STATIC_ROOT = SRC_ROOT + '/static',
	STATIC_FILES = [
		STATIC_ROOT + '/*',
		STATIC_ROOT + '/fonts/*',
		STATIC_ROOT + '/img/*',
		STATIC_ROOT + '/css/*',
		STATIC_ROOT + '/js/*.min.js'
	],

	COMPILED_JS_NAME = 'main.js',
	COMPILED_DIR = 'compiled',
	COMPILED_JS_DIR = COMPILED_DIR + '/js',
	COMPILED_FILES = COMPILED_DIR + '/**/*',

	// Specify order of js files in concatenated js
	JS_ORDER = [
		 '*.js',
	],

	// Change to desired deployment (after compilation)
	DEPLOY_DIR = COMPILED_DIR,

	DEPLOY_FILES = DEPLOY_DIR + '/**/*'
;

gulp.task('build+deploy', function(callback) {
	runSequence(
		'clean',
		'build:ts',
		'move:static',
		'deploy'
	);
	callback();
});

gulp.task('clean', function() {
	return gulp.src([DEPLOY_FILES, COMPILED_FILES], {read: false})
		.pipe(clean({force: true}))
});

gulp.task('deploy', function() {
	return gulp.src(COMPILED_FILES)
		.pipe(gulp.dest(DEPLOY_DIR))
});

gulp.task('move:static', function() {
	return gulp.src(STATIC_FILES, { base : './src/static' })
		.pipe(gulp.dest(COMPILED_DIR))
});

gulp.task('build:ts', function(){

	return gulp.src(TS_SRC)
		.pipe(typescript({
			module: "commonjs",
			target: 'es5'
		}))
		.pipe(order(JS_ORDER))
		.pipe(concat(COMPILED_JS_NAME))
		.pipe(gulp.dest(COMPILED_JS_DIR))
});
