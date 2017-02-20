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
    pngquant           = require('imagemin-pngquant'),         // PNG плагин для ImageMin
    spritesmith        = require('gulp.spritesmith'),          // Конвертируем изображения в спрайты и CSS файлы
    svg2png            = require('gulp-svg2png'),              // Конвертируем SVGs в PNGs
    svgmin             = require('gulp-svgmin'),               // Минификация SVG с SVGO
    svgsprite          = require('gulp-svg-spritesheet'),      // Конвертируем SVG в спрайты и CSS файлы
    path               = require('path'),                      // Работа с путями
    merge              = require('merge-stream');              // Слияние потоков

/* Настройки путей */
var path = {
    /* Пути сборки */
    build: {
        html:               'build/',
        css:                'build/assets/css/',
        js:                 'build/assets/js/',
        jsMainFile:         'main.js',
        img:                'build/assets/img/images/',
        svg:                'build/assets/img/svg/',
        pngSprite:          'build/assets/img/sprites/png/',
        pngSpriteCSS:       'src/sass/common/',
        svgSprite:          'build/assets/img/sprites/svg/svg-sprite.svg',
        svgSpriteNoSvg:     'build/assets/img/sprites/svg/svg-sprite.png',
        svgSpriteCSS:       'src/sass/common/_svg-sprite.scss'
        
    },

    /* Пути источников */
    src: {
        html:               ['src/**/*.html','!src/html/common/**/*.*'],
        sass:               'src/sass/style.scss',
        jsCustom:           'src/js/custom.js',
        jsVendor:           'src/js/vendor.js',
        img:                'src/img/images/**/*.*',
        svg:                'src/img/svg/**/*.svg',
        pngSprite:          'src/img/sprites/png/*.png',
        pngRetinaSprite:    'src/img/sprites/png/*@2x.png',
        pngSpriteTpl:       'src/sass/tpl/_png-sprite.tpl',
        svgSprite:          'src/img/sprites/svg/**/*.svg',
        svgSpriteTpl:       'src/sass/tpl/_svg-sprite.tpl'
        
    },

    /* Пути для отслеживания */
    watch: {
        html:               'src/**/*.html',
        js:                 'src/js/**/*.js',
        sass:               'src/sass/**/*.scss',
        img:                'src/img/images/**/*.*',
        svg:                'src/img/svg/**/*.svg',
        pngSprite:          'src/img/sprites/png/**/*.png',
        svgSprite:          'src/img/sprites/svg/**/*.svg'
    },

    /* Дириктория очистки */
    clean: {
        build:              'build/**/*',
        pngSpriteCSS:       'src/sass/common/*png-sprite.*',
        svgSpriteCSS:       'src/sass/common/*svg-sprite.*'
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
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 5,
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(size({
            title: 'Images.......'
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(connect.reload());
});


/* Задача - Компиляция PNG Спрайт */
gulp.task('png-sprite',function generateSpritesheets () {
    // Генератор стиля
    var spriteData = gulp.src(path.src.pngSprite)
        .pipe(spritesmith({
            imgName:         'png-sprite.png',
            cssName:         '_png-sprite.scss',
            imgPath:         '../img/sprites/png/png-sprite.png',  
            retinaSrcFilter: path.src.pngRetinaSprite,
            retinaImgName:   'png-sprite@2x.png', 
            retinaImgPath:   '../img/sprites/png/png-sprite@2x.png',
            algorithm:       'binary-tree',
            cssTemplate: path.src.pngSpriteTpl,
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
    gulp.src(path.src.svgSprite)
        .pipe(svgsprite({
            cssPathNoSvg: '../img/sprites/svg/svg-sprite.png',
            cssPathSvg: '../img/sprites/svg/svg-sprite.svg',
            padding: 0,
            pixelBase: 16,
            positioning: 'packed',
            templateSrc: path.src.svgSpriteTpl,
            templateDest: path.build.svgSpriteCSS,
            units: 'px'
        }))
        .pipe(svgmin())
        .pipe(gulp.dest(path.build.svgSprite))
        .pipe(svg2png())
        .pipe(gulp.dest(path.build.svgSpriteNoSvg));
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