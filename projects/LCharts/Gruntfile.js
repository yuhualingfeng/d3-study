/**
 * Created by Administrator on 2015/8/27.
 */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',
        less: {
            css: {
                options: {
                    paths: ["css"],
                    "banner": '<%= banner %>'
                },
                files: {
                    "css/mobile.css": "css/mobile.less"
                }
            }
        },
        concat: {
            // options: {
            //   separator: ';',
            // },
            dist: {
                src: [
                'src/start.js',
                'src/liquidFillGauge.js',
                'src/bubbleMenu.js',
                'src/pieChartsLabels.js',
                 'src/end.js'
                 ],
                dest: 'dest/lcharts.js',
            },
        },
        min: {
            'dist': {
                'options': {
                    'report': 'gzip'
                },
                'files': [{
                    'src': 'js/mobile.js',
                    'dest': 'js/mobile.min.js'
                }]
            },
            'zepto': {
                'options': {
                    'report': 'gzip'
                },
                'files': [{
                    'src': 'zepto.js',
                    'dest': 'zepto.min.js'
                }]
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'dest/lcharts.min.js': ['dest/lcharts.js']
                }
            }
        },
        cssmin: {
            'dist': {
                'options': {
                    'report': false
                },
                'files': [{
                    'src': 'css/mobile.css',
                    'dest': 'css/mobile.min.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                browsers: [
                    "Android 2.3",
                    "Android >= 4",
                    "Chrome >= 20",
                    "Firefox >= 24",
                    "Explorer >= 8",
                    "iOS >= 6",
                    "Opera >= 12",
                    "Safari >= 6"
                ]
            },
            core: {
                options: {
                    map: true
                },
                src: 'css/mobile.css'
            }
        },


        watch: {
            // less: {
            //     files: ['css/mobile.less'],
            //     tasks: ['less:css', 'autoprefixer:core', 'cssmin:dist']
            // },
            js: {
                files: [                
                'src/start.js',
                'src/liquidFillGauge.js',
                'src/bubbleMenu.js',
                'src/pieChartsLabels.js',
                'src/end.js'],
                tasks: ['concat']
            }
        }


    });
    grunt.registerTask('default', ['watch']);

};
