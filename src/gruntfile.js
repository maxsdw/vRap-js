module.exports = function ( grunt ) {
    grunt.initConfig({
        uglify: {
            main_target: {
                options: {
                    sourceMap: true,
                    preserveComments: 'some'
                },
                files: {
                    'vrap-js-1.0.7.min.js': [
                        'packages/framework.js',
                        'packages/locale/eng-us.js',
                        'packages/**/*.js'
                    ]
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            src: [ 'packages/**/*.js' ]
        },
        watch: {
            js:  { files: 'packages/**/*.js', tasks: [ 'jshint', 'uglify' ] }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask( 'default', [ 'jshint', 'uglify' ] );
    grunt.registerTask( 'build', [ 'jshint', 'uglify' ] );
};