module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            folder: ['dist']
        },
        uglify: {
            files: {
                src: ['resources/**/*.js', '!resources/plugins/*/**'],
                dest: 'dist/',
                expand: true,
                flatten: false,
                ext: '.js'
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    src: ['resources/**/*.css', '!resources/plugins/*/**'],
                    dest: 'dist/',
                    ext: '.css'
                }]
            }
        },
        watch: {
            js: {
                files: 'resources/**/*.js',
                tasks: ['uglify']
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');


// register at least this one task
    grunt.registerTask('default', ['clean', 'uglify', 'cssmin']);
};
