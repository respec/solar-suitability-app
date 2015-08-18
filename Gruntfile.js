module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    copy: {
      main: {
      },
      release:{
        files: [
          {
            cwd: 'js',
            src: ['**'],
            dest: 'release/js',
            expand: true
          },
          {
            cwd: 'lib',
            src: ['**'],
            dest: 'release/lib',
            expand: true
          },
          {
            cwd:'assets/css',
            src: ['*.css'],
            dest: 'release/assets/css',
            expand: true
          },
          {
            cwd:'assets/images',
            src: ['**'],
            dest: 'release/assets/images',
            expand: true
          },
          {
            cwd:'assets/fonts',
            src: ['**'],
            dest: 'release/assets/fonts',
            expand: true
          },
          {
            cwd: 'styles',
            src: ['main.css'],
            dest: 'release/assets/css',
            expand: true
          },
          {
            expand: true,
            src: 'index.html',
            dest: 'release',
          }
        ]
      },
      bower: {
        files: [
          {
            expand: true,
            src: [
              'bower_components/backbone/backbone.js',
              'bower_components/bootstrap-sass-twbs/assets/javascripts/bootstrap.min.js',
              'bower_components/d3/d3.min.js',
              'bower_components/jquery/dist/jquery.min.js',
              'bower_components/jquery/dist/jquery.min.map',
              'bower_components/modernizr/modernizr.js',
              'bower_components/underscore/underscore-min.js',
              'bower_components/underscore/underscore-min.map',
              'bower_components/jspdf/dist/jspdf.min.js',
              'bower_components/js-cookie/src/js.cookie.js'
            ],
            dest: './lib',
            flatten: true
          },
          // D3-tip requires rename
          {
            expand: true,
            src: [
              'bower_components/d3-tip/index.js'
            ],
            dest: './lib/',
            rename: function(dest, src){
              return dest + src.replace('index.js', 'd3-tip.js');
            },
            flatten: true
          }
        ]
      },
      initStyles: {
        files: [{
          expand: true,
          cwd: 'bower_components/bootstrap-sass-twbs/assets/stylesheets/',
          src: ['**'],
          dest: 'styles/bootstrap',
        }]
      },
      cssToAssetsCSS: {
        files: [{
          expand: true,
          src: [
            'styles/main.css'
          ],
          dest: 'assets/css',
          flatten: true
        }]
      },
      stylesAndFonts: {
        files: [{
          expand: true,
          src: [
            'bower_components/fontawesome/css/font-awesome.min.css',
            'styles/main.css'
          ],
          dest: 'assets/css',
          flatten: true
        },
        {
          cwd: 'bower_components/bootstrap-sass-twbs/assets/fonts/bootstrap',
          src: ['**'],
          dest: 'assets/fonts',
          expand: true
        },
        {
          cwd: 'bower_components/fontawesome/fonts/',
          src: ['**'],
          dest: 'assets/fonts',
          expand: true
        }]
      },

      git: {
        files: [
          {
            src: [
              '.gitignore',
              '.jshintrc',
              'bower.json',
              'Gruntfile.js',
              'index.html',
              'package.json'
            ],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0',
            expand: true
          },
          {
            expand: true,
            cwd: 'assets',
            src: ['**'],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0/assets/',
            flatten: false
          },
          {
            expand: true,
            cwd: 'js',
            src: ['**'],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0/js/',
            flatten: false
          },
          {
            expand: true,
            cwd: 'lib',
            src: ['**'],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0/lib/',
            flatten: false
          },
          {
            expand: true,
            cwd: 'proxy',
            src: ['**'],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0/proxy/',
            flatten: false
          },
          {
            expand: true,
            cwd: 'styles',
            src: ['**'],
            dest: 'C:/Users/Chris/Documents/GitHub/SolarApp2.0/styles/',
            flatten: false
          }
          // {
          //   cwd: 'bower_components/bootstrap/fonts/',
          //   src: ['**'],
          //   dest: 'assets/fonts',
          //   expand: true
          // },
          // {
          //   cwd: 'bower_components/fontawesome/fonts/',
          //   src: ['**'],
          //   dest: 'assets/fonts',
          //   expand: true
          // }
        ]

      }
    },

    clean: ['release'],

    shell: {
      bowerInstall: {
        command: 'bower install'
      }
    },

    watch: {
      css: {
        files: ['styles/*.scss'],
        tasks: ['sass', 'copy:cssToAssetsCSS']
      }
    },

    sass: {
      dist: {
        files: {
          'styles/main.css': 'styles/main.scss'
        }
      }
    },

    comments: {
      js: {
        options: {
          singleline: true,
          multiline: false
        },
        src: [ 'release/app/*.js' ]
      },
      html: {
        options: {
          singleline: true,
          multiline: true
        },
        src: [ 'release/*.html' ]
      }
    },
  });

  grunt.registerTask('init',['clean', 'shell:bowerInstall', 'copy:bower', 'copy:stylesAndFonts', 'copy:initStyles']);
  // grunt.registerTask('build',['clean', 'copy']);
  grunt.registerTask('release', ['clean', 'copy:release']);
  grunt.registerTask('git', ['copy:git']);
};