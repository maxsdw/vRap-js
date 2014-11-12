module.exports = function ( grunt ) {
    grunt.initConfig({
        uglify: {
            main_target: {
                options: {
                    sourceMap: true,
                    preserveComments: 'some'
                },
                files: {
                    'vrap-js-1.0.0.min.js': [
                        'packages/framework.js',
                        'packages/classes/primitives/*.js',
                        'packages/classes/widgets/*.js',
                        'packages/classes/model/*.js'
                    ]
                }
            }
        },
        watch: {
            js:  { files: 'packages/**/*.js', tasks: [ 'uglify' ] }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [ 'uglify' ]);
};