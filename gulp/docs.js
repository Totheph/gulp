const gulp = require('gulp');

const fileInclude = require('gulp-file-include');

const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};

/*Чтобы файлы, которые мы не изменили. не обрабатывались каждый раз*/
const changed = require('gulp-changed');

/*Ошибки и уведомления*/
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false
    })
  }
}

/*HTML*/
const htmlClean = require('gulp-htmlclean');
const webpHtml = require('gulp-webp-html');

gulp.task('html:docs', function(){
  return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])   /* возвращает поток. gulp.src создает поток */
  .pipe(changed('./docs/'))
  .pipe(plumber(plumberNotify("HTML")))
  .pipe(fileInclude(fileIncludeSettings)) /*через pipe обрабатываем файлы, которые получил src + указываем настройки*/
  .pipe(webpHtml())
  .pipe(htmlClean())
  .pipe(gulp.dest('./docs/'))
});

/*scss*/
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const webpCss = require('gulp-webp-css');
/*Исходные карты*/
const sourceMaps = require('gulp-sourcemaps');

const groupMedia = require('gulp-group-css-media-queries');

gulp.task('sass:docs', function(){
  return gulp.src('./src/scss/*.scss')
  .pipe(changed('./docs/css/'))
  .pipe(plumber(plumberNotify("SASS")))
  .pipe(sourceMaps.init())
  .pipe(autoprefixer())
  .pipe(sassGlob())
  .pipe(webpCss())
  .pipe(groupMedia())
  .pipe(sass())
  .pipe(csso())
  .pipe(sourceMaps.write())
  .pipe(gulp.dest('./docs/css'))
})

/*JS */
const webpack = require('webpack-stream')
gulp.task("js:docs", function(){
  return gulp.src('./src/js/*.js')
    .pipe(changed('./docs/js/'))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(babel())
    .pipe(webpack(require('./../webpack.config.js')))
    .pipe(gulp.dest('./docs/js'))
})

/*Fonts*/
gulp.task("fonts:docs", function(){
  return gulp.src('./src/fonts/**/*')
    .pipe(changed('./docs/fonts/'))
    .pipe(gulp.dest('./docs/js'))
})

/*Files*/
gulp.task("files:docs", function(){
  return gulp.src('./src/files/**/*')
    .pipe(changed('./docs/files/'))
    .pipe(gulp.dest('./docs/files/'))
})

/*Babel*/
const babel = require('gulp-babel')

/*Сжатие изображений*/
const imagemin = require('gulp-imagemin');

//Webp//
const webp = require('gulp-webp');
/*Копирование изображений и впринципе любых файлов из src в docs*/

gulp.task("images:docs", function(){
  return gulp.src("./src/images/**/*") /*файлы из любых папок любого уровня вложенности в images*/
  .pipe(changed('./docs/images/'))
  .pipe(webp())
  .pipe(gulp.dest('./docs/images/'))

  .pipe(gulp.src("./src/images/**/*"))
  .pipe(changed('./docs/images/'))
  .pipe(imagemin({verbose: true})) /*увидим, какие файлы преобразованы и сколько места освободилось*/
  .pipe(gulp.dest('./docs/images/'))
})

/*Создаем live сервер*/
const server = require('gulp-server-livereload');

const serverOptions = {
  livereload: true,
  open: true
}

gulp.task('server:docs', function(){
  return gulp.src('./docs/').pipe(server(serverOptions));
})

/*Clean - перед каждой сборкой удалять старый docs файл, чтобы там были только актуальные файлы*/

const clean = require('gulp-clean');

const fs = require('fs') /*fs = file system - для работы с файлами*/

gulp.task("clean:docs", function(done){
  if (fs.existsSync('./docs/')){
    return gulp.src('./docs/', {read: false})
    .pipe(clean());
  }
  done();
});


