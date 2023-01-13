const { src, dest, task, series, watch, parallel } = require("gulp");
const rm = require("gulp-rm");
const gulpSass = require("gulp-sass");
const nodeSass  = require("node-sass");
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const {SRC_PATH, DIST_PATH, STYLE_LIBS, JS_LIBS} = require('./gulp.config');
const gulpif = require('gulp-if');
const env = process.env.NODE_ENV;

const sass = gulpSass(nodeSass);

task("clean", () => {
  return src(`${DIST_PATH}/**/*`, { read: false }).pipe(rm());
})
 
task("copy:html", () => {
 return src(`${SRC_PATH}/*.html`)
 .pipe(dest(DIST_PATH))
 .pipe(reload({stream: true}));
});

task("pages", () => {
  return src(`${SRC_PATH}/pages/*.*`)
  .pipe(dest(`${DIST_PATH}/pages`))
  .pipe(reload({stream: true}));
 });
 

task("copy:images", () => {
  return src(`${SRC_PATH}/img/**/*.*`)
  .pipe(dest(`${DIST_PATH}/img`))
  .pipe(reload({stream: true}));
 });

 
task('styles', () => {
  return src([...STYLE_LIBS, 'src/styles/main.scss'])
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(env === 'dev',
      autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    )
    .pipe(gulpif(env === 'prod', cleanCSS()))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest(`${DIST_PATH}/css`))
    .pipe(reload({ stream: true }));
 });


task("scripts", () => {
  return src([...JS_LIBS, "src/scripts/*.js"])
  .pipe(gulpif(env === 'dev', sourcemaps.init()))
  .pipe(concat("main.min.js", {newLine: ";"}))
  .pipe(gulpif(env === 'prod', babel({
    presets: ['@babel/env']
  })))
  .pipe(uglify())
  .pipe(gulpif(env === 'dev', sourcemaps.write()))
  .pipe(dest(DIST_PATH))
  .pipe(reload({stream: true}));
});

task("server", () => {
  browserSync.init({
      server: {
          baseDir: "./docs",
      },
  });
});

task("watch", () =>{
  watch("./src/styles/**/*.scss", series("styles"));
  watch('./src/pages/*.html', series("pages"));
  watch("./src/*.html", series("copy:html"));
  watch("./src/scripts/*.js", series("scripts"));
  watch("./src/img/**", series("copy:images"));
});

task(
  "default", 
  series("clean", parallel("copy:html", "copy:images","pages", "styles", "scripts"), 
  parallel("watch", "server")
  )
);

task(
  "build", 
  series("clean", parallel("copy:html", "copy:images","pages", "styles", "scripts"))
);

