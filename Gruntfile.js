module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        src: ['music/**', 'lib/**', 'index.html'],
        dest: 'dist/',
        expand: true
      }
    },
    uglify: {
      build: {
        src: 'js/*.js',
        dest: 'dist/js/jsprove.min.js'
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/css/jsprove.min.css': ['css/*.css']
        }
      }
    },
    cacheBust: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 16,
        deleteOriginals: true
      },
      assets: {
        files: [{
          src: ['dist/index.html']
        }]
      }
    }
  });

  // Load the CSS minification plugin
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the cachebusting plugin
  grunt.loadNpmTasks('grunt-cache-bust');

  // Load the file copying plugin
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'uglify', 'cssmin', 'cacheBust']);

};
