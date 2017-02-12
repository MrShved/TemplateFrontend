'use strict';

/* Gulp плагины */
var gulp               = require('gulp'),                      // Движок
	connect            = require('gulp-connect'),              // Запуск сервера
	opn                = require('opn'),                       // Открываем чего либо в браузере
	del                = require('del'),                       // Удаление чего либо
	rigger             = require('gulp-rigger'),               // Включаем содержимое файла в другой файл
	size               = require('gulp-size'),                 // Отображение размера файлов в консоли
	sequence        = require('gulp-sequence')     // Выполнение тасков в определенном порядке

/* Настройки путей */
var projectPath = {
	dest: {
		/* Пути сборки */
		html:               'build/'
	},
	src: {
		/* Пути источников */
		html:               ['app/**/*.html', '!app/html/common/**/*.*']
	},
	watch: {
	/* Пути для отслеживания */
		html:               'app/**/*.html'
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

/* Очистка проекта */
gulp.task('clean', function () {
    del(projectPath.clean);
});

/* Сборка */
gulp.task('build', function (cb) {
	sequence('clean', 'html') (cb)
});

/* Отслеживание */
gulp.task('watch', function() {
	gulp.watch([projectPath.watch.html], ['html']);
});

/*По умолчанию*/
gulp.task('default', ['connect', 'watch']);