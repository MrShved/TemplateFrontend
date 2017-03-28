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
    cssmin             = require('gulp-clean-css'),            // Минификация CSS
    imagemin           = require('gulp-imagemin'),             // Оптимизация изображений
    mozjpeg            = require('imagemin-mozjpeg'),          // Минимизируем изображения
    pngquant           = require('imagemin-pngquant'),         // PNG плагин для ImageMin
    spritesmith        = require('gulp.spritesmith'),          // Конвертируем изображения в спрайты и CSS файлы
    svg2png            = require('gulp-svg2png'),              // Конвертируем SVGs в PNGs
    svgmin             = require('gulp-svgmin'),               // Минификация SVG с SVGO
    cheerio            = require('gulp-cheerio'),              // Меняем параметры в файлах
    svgstore           = require('gulp-svgstore'),             // Собираем SVG спрайт
    path               = require('path'),                      // Работа с путями
    merge              = require('merge-stream');              // Слияние потоков


/* Настройки путей */

// Глобальные пути
var path = {
    srcPath:   'src/',
    buildPath: 'build/',
    cmsPath:   'assets/',
}

var path = {

    /* Пути сборки */
    build: {
        html:               path.buildPath,
        css:                path.buildPath + path.cmsPath + 'css/',
        js:                 path.buildPath + path.cmsPath + 'js/',
        jsMainFile:         'main.js',
        img:                path.buildPath + path.cmsPath + 'images/',
        svg:                path.buildPath + path.cmsPath + 'img/svg/',
        pngSprite:          path.buildPath + path.cmsPath + 'img/sprites/png/',
        pngSpriteCSS:       path.srcPath + 'sass/mixins/',
        svgSprite:          path.buildPath + path.cmsPath + 'img/sprites/svg',
    },

    /* Пути источников */
    src: {
        html: [
                            path.srcPath + '**/*.html',
                            '!' + path.srcPath + '/html/common/**/*.*'
        ],
        sass:               path.srcPath + 'sass/style.scss',
        jsCustom:           path.srcPath + 'js/custom.js',
        jsVendor:           path.srcPath + 'js/vendor.js',
        img:                path.srcPath + 'img/images/**/*.*',
        svg:                path.srcPath + 'img/svg/**/*.svg',
        pngSprite:          path.srcPath + 'img/sprites/png/',
        svgSprite:          path.srcPath + 'img/sprites/svg/**/*.svg',
    },

    /* Пути для отслеживания */
    watch: {
        html:               path.srcPath + '**/*.html',
        js:                 path.srcPath + 'js/**/*.js',
        sass:               path.srcPath + 'sass/**/*.scss',
        img:                path.srcPath + 'img/images/**/*.*',
        svg:                path.srcPath + 'img/svg/**/*.svg',
        pngSprite:          path.srcPath + 'img/sprites/png/',
        svgSprite:          path.srcPath + 'img/sprites/svg/**/*.svg'
    },

    /* Дириктория очистки */
    clean: {
        build:              path.buildPath + '**/*',
        pngSpriteCSS:       path.srcPath + 'sass/mixins/*png-sprite.*'
    }
};

/* Задача - Запуск сервера */
gulp.task('connect', function() {
    connect.server({
        root: 'build',
        livereload: true,
        port: 8080
    });
    opn('http:/localhost:8080');
});

/* Задача - HTML */
gulp.task('html', function () {
    return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(size({
        title: '    HTML '
        }))
    .pipe(gulp.dest(path.build.html))
    .pipe(connect.reload());
});

/* Задача - Sass */
gulp.task('sass', function generateSass () {
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths,
            outputStyle: 'expanded',
            precision: 4,
            }))
        .pipe(prefixer('> 2%'))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({
            suffix: '.min'
            }))
        .pipe(cssmin())
        .pipe(sourcemaps.write('./'))
        .pipe(size({
            showTotal: false,
            title: '     CSS '
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(connect.reload());
});

/* Задача - JavaScript */
gulp.task('js', function () {
    return streamqueue({
        objectMode: true
        },
        gulp.src(path.src.jsVendor)
            .pipe(rigger())
            .pipe(size({
                title: 'VendorJS '
            })),
        gulp.src(path.src.jsCustom)
            .pipe(rigger())
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(size({
                title: 'CustomJS '
            }))
    )
    .pipe(concat(path.build.jsMainFile))
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(path.build.js))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(size({
        title: ' TotalJS '
        }))
    .pipe(gulp.dest(path.build.js))
    .pipe(connect.reload());
});

/* Задача - Изображения */
gulp.task('images', function () {
    return gulp.src(path.src.img)
        .pipe(imagemin([
            pngquant(),
            mozjpeg({
                //progressive: true,
                quality: 88
            })
        ]))
        .pipe(size({
            title: 'Images.......'
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(connect.reload());
});


/* Задача - Компиляция PNG Спрайт */
gulp.task('png-sprite',function generateSpritesheets () {

    // Имя PNG спрайта
    var nameSprite = 'png-sprite';

    // Генератор стиля
    var spriteData = gulp.src(path.src.pngSprite + '**/*.png')
        .pipe(spritesmith({
            imgName: nameSprite + '.png',
            cssName: '_' + nameSprite + '.scss',
            imgPath: '../img/sprites/png/' + nameSprite +'.png',  
            retinaSrcFilter: path.src.pngSprite + '**/*@2x.png',
            retinaImgName: nameSprite + '@2x.png', 
            retinaImgPath: '../img/sprites/png/' + nameSprite + '@2x.png',
            algorithm: 'binary-tree',
            cssVarMap: function(sprite) {
                sprite.name = 'sprite-' + sprite.name
            }   
    }));

    // Задача для изображения
    var imgStream = spriteData.img
        .pipe(gulp.dest(path.build.pngSprite));

    // Задача для стиля
    var sassStream = spriteData.css
        .pipe(gulp.dest(path.build.pngSpriteCSS))
        .pipe(connect.reload());

    return merge(imgStream, sassStream);
});

/* Задача - Компиляция SVG Спрайт */
gulp.task('svg-sprite', function () {
    return gulp.src(path.src.svgSprite)
        .pipe(svgmin(function (file) {
            return {
                plugins: [
                {cleanupIDs: { minify: true }},
                {removeTitle: { remove : true }}
                ]
            }
        }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(cheerio(function ($) {
            $('svg').attr('style',  'display:none');
        }))
        .pipe(rename('sprite-svg.svg'))
        .pipe(gulp.dest(path.build.svgSprite));
});

/* Задача - Очистка проекта */
gulp.task('clean', function () {
    del(path.clean.build);
    del(path.clean.pngSpriteCSS);
});

/* Задача - Отслеживание */
gulp.task('watch', function () {
    gulp.watch([path.watch.html],       ['html']);
    gulp.watch([path.watch.sass],       ['sass']);
    gulp.watch([path.watch.js],         ['js']);
    gulp.watch([path.watch.img],        ['images']);
    gulp.watch([path.watch.pngSprite],  ['png-sprite']);
    gulp.watch([path.watch.svgSprite],  ['svg-sprite']);
});

/* Задача - Сборка */
gulp.task('build', sequence('clean', 'html', 'png-sprite', 'svg-sprite', 'js', 'images', 'sass'))

/*По умолчанию*/
gulp.task('default', ['connect', 'watch']);