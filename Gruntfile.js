module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        src: ['music/**', 'lib/**'],
        dest: 'dist/',
        expand: true
      }
    },
    uglify: {
      build: {
        src: 'js/*.js',
        dest: 'dist/js/jsprove.js'
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/css/jsprove.css': ['css/*.css']
        }
      }
    },
    processhtml: {
      options: {
      },
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    cachebreaker: {
      production: {
        options: {
          match: ['js/jsprove.js', 'css/jsprove.css'],
          position: 'filename'
        },
        files: {
          src: ['dist/index.html']
        }
      }
    }
  });

  // Load the CSS minification plugin
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the cachebusting plugin
  grunt.loadNpmTasks('grunt-cache-breaker');

  // Load the file copying plugin
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Load the plugin that provides the "htmlmin" task.
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // Load the plugin that provides the "processhtml" task.
  grunt.loadNpmTasks('grunt-processhtml');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'uglify', 'cssmin', 'processhtml', 'htmlmin', 'cachebreaker']);

};
