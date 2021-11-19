const gulp = require('gulp')
const { src, series, dest, watch, task, parallel } = gulp

const browsersync = require("browser-sync")
const server = browsersync.create()
const shell = require("gulp-shell")
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const twig = require('gulp-twig')

task('scss:dev', () => {
    return src('src/assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/assets/css'))
})

task('scss', () => {
    return src('src/assets/scss/**/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(dest('public/assets/css'))
})

task('scss:watch', () => {
    watch('src/assets/scss/**/*.scss', series(['scss:dev']))
})

task('twig', () => {
    return src('src/views/**/[^_]*.twig')
        .pipe(twig())
        .pipe(dest('public'))
})

task('twig:watch', () => {
    watch('src/views/**/*.twig', series(['twig']))
})

task('dev:serve', () => {
    server.init({
        files: ["public/**/*"],
        watchEvents: ["add", "change", "addDir"],
        server: "public",
        port: 5000
    })
})

task('public:clean', shell.task('npx rimraf public'))

task('ts:compile', shell.task('npx rollup --config rollup.config.js'))
task('ts:compile:dev', shell.task('npx rollup --config rollup.config.js --config-dev'))
task('ts:watch', shell.task('npx rollup --config rollup.config.js --config-dev --watch'))

task('build', series(['ts:compile', 'scss', 'twig']))
task('dev', series([
    'public:clean',
    parallel([
        'scss:dev',
        'twig',
        'ts:compile:dev'
    ]),
    parallel([
        'dev:serve',
        'ts:watch',
        'scss:watch',
        'twig:watch'
    ])
]))
