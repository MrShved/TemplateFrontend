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
    streamqueue        = require('streamqueue'),               // Очередь потоков , сохранение потоков данных
    sass               = require('gulp-sass'),                 // Компилируем Sass файлы
    prefixer           = require('gulp-autoprefixer'),         // Автопревиксы
    cssmin             = require('gulp-clean-css')             // Минификация CSS

/* Настройки путей */
var projectPath = {
    /* Пути сборки */
    build: {
        html:               'build/',
        js:                 'build/assets/js/',
        jsMainFile:         'main.js',
        css:                'build/assets/css/'
    },

    /* Пути источников */
    src: {
        html:               ['src/**/*.html','!src/html/common/**/*.*'],
        jsCustom:           'src/js/custom.js',
        jsVendor:           'src/js/vendor.js',
        sass:               'src/sass/style.scss'
    },

    /* Пути для отслеживания */
    watch: {
        html:               'src/**/*.html',
        js:                 'src/js/**/*.js',
        sass:               'src/sass/**/*.scss'
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
    .pipe(gulp.dest(projectPath.build.html))
    .pipe(connect.reload());
});

/* Sass */
gulp.task('sass', function() {
    gulp.src(projectPath.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths
            }))
        .pipe(prefixer('> 2%'))
        .pipe(gulp.dest(projectPath.build.css))
        .pipe(rename({
            suffix: '.min'
            }))
        .pipe(cssmin())
        .pipe(sourcemaps.write('./'))
        .pipe(size({
            title: 'CSS'
        }))
        .pipe(gulp.dest(projectPath.build.css))
        .pipe(connect.reload());
});

/* JavaScript */
gulp.task('js', function () {
    streamqueue({
        objectMode: true
        },
        gulp.src(projectPath.src.jsVendor)
            .pipe(rigger())
            .pipe(size({
                title: 'Vendor JavaScript'
            })),
        gulp.src(projectPath.src.jsCustom)
            .pipe(rigger())
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(size({
                title: 'Custom JavaScript'
            }))
    )
    .pipe(concat(projectPath.build.jsMainFile))
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(projectPath.build.js))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(size({
        title: 'Total JavaScript'
        }))
    .pipe(gulp.dest(projectPath.build.js))
    .pipe(connect.reload());
});

/* Очистка проекта */
gulp.task('clean', function () {
    del(projectPath.clean);
});

/* Отслеживание */
gulp.task('watch', function () {
    gulp.watch([projectPath.watch.html], ['html']);
    gulp.watch([projectPath.watch.sass], ['sass']);
    gulp.watch([projectPath.watch.sass], ['js']);
});

/* Сборка */
gulp.task('build', function (cb) {
    sequence(
        'clean',
        'html',
        'sass',
        'js') (cb)
});

/*По умолчанию*/
gulp.task('default', ['connect', 'watch']);