
module.exports = function(grunt) {
  var path = require('path');

  var SOURCE_FILES = [
    'src/ts/**/*.ts',
    '!src/ts/types/**'
  ]

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /**
     * 1 - Transpile all TypeScript sources to ES6
     */
    ts: {
      default: {
        src: SOURCE_FILES,
        outDir: '_build/phase1',
        options: {
          target: 'es6',
          coments: true
        }
      }
    },

    /**
     * 2 - Compile the app sources to a single bundle using
     * browserify, running babeljs over the sources on the way.
     */
    browserify: {

      dep: {
        files: {
          '_build/dependencies.js' : [
            'src/js/dependencies.js'
          ]
        },
        options: {
          browserifyOptions: {
            // debug: true
          }
        }
      },

      app: {
        files: {
          '_build/phase2.js' : [
            '_build/phase1/**/*.js'
          ]
        },
        options: {
          transform: [
            'babelify'
          ],
          browserifyOptions: {
            // debug: true
          }
        }
      }
    },

    /**
     * 3 - Precompile the handlebars templates
     */
    handlebars: {
      all: {
        options: {
          partialsUseNamespace: true,
          namespace: function(filename) {
            return path.dirname(filename).split('/').join('.').replace('src', 'tessera')
          },
          processName: function(filename) {
            var pieces = filename.split('/')
            return pieces[pieces.length - 1].split('.')[0]
          }
        },
        files: {
          '_build/templates.js' : [ 'src/templates/**/*.hbs']
        }
      }
    },

    /**
     * 4 - Concatenate the transpiled sources, the precompiled
     * templates, and the babel polyfill required for all ES6 support.
     */
    concat: {
      dep_css: {
        src: [
          'tessera/static/css/bootstrap.css',
          'tessera/static/css/bootstrap-callouts.css',
          'tessera/static/css/bootstrap-editable.css',
          'tessera/static/css/bootstrap-datetimepicker.css',
          'tessera/static/css/bootstrapValidator.min.css',
          'tessera/static/css/font-awesome.css',
          'tessera/static/css/select2.css',
          'tessera/static/css/select2-bootstrap.css',
          'tessera/static/css/dataTables.bootstrap.css',
          'tessera/static/css/jquery.flot.valuelabels.css'
        ],
        dest: 'tessera/static/css/bundle.css'
      },
      dep_js: {
        options: {
          separator: ';'
        },
        src: [
          '_build/dependencies.js',
          'tessera/static/js/moment-timezone-with-data.min.js',
          'tessera/static/js/tagmanager.js',
          'tessera/static/js/bootstrap-editable.min.js',
          'tessera/static/js/bootstrap-datetimepicker.min.js',
          'tessera/static/js/bootstrapValidator.min.js',
          'tessera/static/js/flot/jquery.flot.js',
          'tessera/static/js/flot/jquery.flot.time.js',
          'tessera/static/js/flot/jquery.flot.multihighlight.js',
          'tessera/static/js/flot/jquery.flot.d3.stack.js',
          'tessera/static/js/flot/jquery.flot.crosshair.js',
          'tessera/static/js/flot/jquery.flot.axislabels.js',
          'tessera/static/js/flot/jquery.flot.downsample.js',
          'tessera/static/js/flot/jquery.flot.valuelabels.js',
          'tessera/static/js/flot/jquery.flot.pie.js',
          'tessera/static/js/flot/jquery.flot.barnumbers.enhanced.js',
          'tessera/static/js/equalize.min.js'
        ],
        dest: 'tessera/static/bundle.js'
      },
      app: {
        options: {
          separator: ';'
        },
        src: [
          'node_modules/babel-core/browser-polyfill.js',
          '_build/templates.js',
          '_build/phase2.js'
        ],
        dest: 'tessera/static/tessera.js'
      }
    },

    watch: {
      files: [
        'js/**/*.js',
        'ts/**/*.ts',
        'templates/**/*.hbs',
        'tessera/static/js/**/*.js',
        'tessera/static/css/**/*.css',
        'tessera/static/tessera.css',
        'tessera/static/tessera-typography.css'
      ],
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-ts-1.5');

  /** Compile the tessera source and templates */
  grunt.registerTask('app', ['ts', 'browserify:app', 'handlebars', 'concat:app'])

  /** Compile all third-party dependencies */
  grunt.registerTask('dep', ['browserify:dep', 'concat:dep_js', 'concat:dep_css']);

  grunt.registerTask('all', ['app', 'dep'])

  grunt.registerTask('default', ['app'])
}
