'use strict';

/* Gulp плагины */
var gulp               = require('gulp'),                      // Движок
    connect            = require('gulp-connect'),              // Запуск сервера
    opn                = require('opn'),                       // Открываем чего либо в браузере
    del                = require('del'),                       // Удаление чего либо
    rigger             = require('gulp-rigger'),               // Включаем содержимое файла в другой файл
    size               = require('gulp-size'),                 // Отображение размера файлов в консоли
    sequence           = require('gulp-sequence'),             // Выполнение тасков в определенном порядке
    rename             = require('gulp-rename'),               // Переименование файлов
    jshint             = require('gulp-jshint'),               // Отслеживание ошибок JS
    stylish            = require('jshint-stylish'),            // Стилизует вывод JS ошибок в консоль
    uglify             = require('gulp-uglify'),               // Минификация JS 
    concat             = require('gulp-concat'),               // Объединение файлов
    sourcemaps         = require('gulp-sourcemaps'),           // Написание карт встроенных источников
    streamqueue        = require('streamqueue')                // Очередь потоков , сохранение потоков данных

/* Настройки путей */
var projectPath = {
    /* Пути сборки */
    dest: {
        html:               'build/',
        js:                 'build/js/',
        jsMainFile:         'main.js'
    },

    /* Пути источников */
    src: {
        html:               ['app/**/*.html','!app/html/common/**/*.*'],
        jsCustom:           'app/js/custom.js',
        jsVendor:           'app/js/vendor.js'
    },

    /* Пути для отслеживания */
    watch: {
        html:               'app/**/*.html',
        js:                 'app/js/**/*.js'
        },

    /* Исключение для очистки */
    clean:                  'build/**/*'
};

/* Запускаем сервер */
gulp.task('connect', function() {
    connect.server({
        root: 'build',
        livereload: true,
        port: 8080
    });
    opn('http:/localhost:8080');
});

/* HTML */
gulp.task('html', function () {
    gulp.src(projectPath.src.html)
    .pipe(rigger())
    .pipe(size({
        title: 'HTML'
        }))
    .pipe(gulp.dest(projectPath.dest.html))
    .pipe(connect.reload());
});

/* JavaScript */
gulp.task('js', function () {
    return streamqueue({
        objectMode: true
        },
        gulp.src(projectPath.src.jsVendor)
            .pipe(rigger())
            .pipe(size({title: 'Vendor JavaScript'})),
        gulp.src(projectPath.src.jsCustom)
            .pipe(rigger())
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(size({title: 'Custom JavaScript'}))
    )
    .pipe(concat(projectPath.dest.jsMainFile))
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(projectPath.dest.js))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(size({
        title: 'Total JavaScript'
        }))
    .pipe(gulp.dest(projectPath.dest.js))
    .pipe(connect.reload());
});

/* Очистка проекта */
gulp.task('clean', function () {
    del(projectPath.clean);
});

/* Сборка */
gulp.task('build', function (cb) {
    sequence('clean', 'html', 'js') (cb)
});

/* Отслеживание */
gulp.task('watch', function() {
    gulp.watch([projectPath.watch.html], ['html']);
    gulp.watch([projectPath.watch.html], ['js']);
});

/*По умолчанию*/
gulp.task('default', ['build','connect', 'watch']);