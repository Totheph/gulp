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

gulp.task('html:dev', function(){
  return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])   /* возвращает поток. gulp.src создает поток */
  .pipe(changed('./build/', { hasChanged: changed.compareContents }))
  .pipe(plumber(plumberNotify("HTML")))
  .pipe(fileInclude(fileIncludeSettings)) /*через pipe обрабатываем файлы, которые получил src + указываем настройки*/
  .pipe(gulp.dest('./build/'))
});

/*scss*/
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
/*Исходные карты*/
const sourceMaps = require('gulp-sourcemaps');


gulp.task('sass:dev', function(){
  return gulp.src('./src/scss/*.scss')
  .pipe(changed('./build/css/'))
  .pipe(plumber(plumberNotify("SASS")))
  .pipe(sourceMaps.init())
  .pipe(sassGlob())
  .pipe(sass())
  .pipe(sourceMaps.write())
  .pipe(gulp.dest('./build/css'))
})

/*JS */
const webpack = require('webpack-stream')
gulp.task("js:dev", function(){
  return gulp.src('./src/js/*.js')
    .pipe(changed('./build/js/'))
    .pipe(plumber(plumberNotify("JS")))
    /*.pipe(babel()) - для старых браузеров*/ 
    .pipe(webpack(require('./../webpack.config.js')))
    .pipe(gulp.dest('./build/js'))
})

/*Fonts*/
gulp.task("fonts:dev", function(){
  return gulp.src('./src/fonts/**/*')
    .pipe(changed('./build/fonts/'))
    .pipe(gulp.dest('./build/js'))
})

/*Files*/
gulp.task("files:dev", function(){
  return gulp.src('./src/files/**/*')
    .pipe(changed('./build/files/'))
    .pipe(gulp.dest('./build/files/'))
})

/*Babel*/
const babel = require('gulp-babel')

/*Сжатие изображений*/
const imagemin = require('gulp-imagemin');

/*Копирование изображений и впринципе любых файлов из src в build*/

gulp.task("images:dev", function(){
  return gulp.src("./src/images/**/*") /*файлы из любых папок любого уровня вложенности в images*/
  .pipe(changed('./build/images/'))
  /*.pipe(imagemin({verbose: true})) увидим, какие файлы преобразованы и сколько места освободилось*/
  .pipe(gulp.dest('./build/images/'))
})

/*Создаем live сервер*/

const server = require('gulp-server-livereload');

const serverOptions = {
  livereload: true,
  open: true
}

gulp.task('server:dev', function(){
  return gulp.src('./build/').pipe(server(serverOptions));
})

/*Clean - перед каждой сборкой удалять старый build файл, чтобы там были только актуальные файлы*/

const clean = require('gulp-clean');

const fs = require('fs') /*fs = file system - для работы с файлами*/

gulp.task("clean:dev", function(done){
  if (fs.existsSync('./build/')){
    return gulp.src('./build/', {read: false})
    .pipe(clean());
  }
  done();
})

/*Watch - слежение за файлами из src, чтобы шла пересборка при их обновлении*/

gulp.task('watch:dev', function(){
  gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
  gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
  gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
  gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
  gulp.watch('./src/images/**/*', gulp.parallel('images:dev'));
  gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'))
});



