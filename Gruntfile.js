
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
            return path.dirname(filename).split('/').join('.').replace('src', 'ts')
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
          'src/3rd-Party/css/bootstrap.css',
          'src/3rd-Party/css/bootstrap-callouts.css',
          'src/3rd-Party/css/bootstrap-editable.css',
          'src/3rd-Party/css/bootstrap-datetimepicker.css',
          'src/3rd-Party/css/bootstrapValidator.min.css',
          'src/3rd-Party/css/font-awesome.css',
          'src/3rd-Party/css/select2.css',
          'src/3rd-Party/css/select2-bootstrap.css',
          'src/3rd-Party/css/dataTables.bootstrap.css',
          'src/3rd-Party/css/jquery.flot.valuelabels.css',
          'src/3rd-Party/css/highlight-styles/github.css'
        ],
        dest: 'tessera/static/css/bundle.css'
      },
      dep_js: {
        options: {
          separator: ';'
        },
        src: [
          '_build/dependencies.js',
          'src/3rd-Party/js/moment-timezone-with-data.min.js',
          'src/3rd-Party/js/tagmanager.js',
          'src/3rd-Party/js/bootstrap-editable.min.js',
          'src/3rd-Party/js/bootstrap-datetimepicker.min.js',
          'src/3rd-Party/js/bootstrapValidator.min.js',
          'src/3rd-Party/js/flot/jquery.flot.js',
          'src/3rd-Party/js/flot/jquery.flot.time.js',
          'src/3rd-Party/js/flot/jquery.flot.multihighlight.js',
          'src/3rd-Party/js/flot/jquery.flot.d3.stack.js',
          'src/3rd-Party/js/flot/jquery.flot.crosshair.js',
          'src/3rd-Party/js/flot/jquery.flot.axislabels.js',
          'src/3rd-Party/js/flot/jquery.flot.downsample.js',
          'src/3rd-Party/js/flot/jquery.flot.valuelabels.js',
          'src/3rd-Party/js/flot/jquery.flot.pie.js',
          'src/3rd-Party/js/flot/jquery.flot.barnumbers.enhanced.js',
          'src/3rd-Party/js/equalize.min.js'
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

    /**
     * 5 - Copy sources to the static resources dir.
     */
    copy: {
      dep: {
        files: [
          { expand: true, cwd: 'src/3rd-Party/fonts/', src: '**', dest: 'tessera/static/fonts/' },
          { expand: true, cwd: 'src/3rd-Party/img/', src: '**', dest: 'tessera/static/img/' }
        ]
      },
      app: {
        files: [
          { expand: true, cwd: 'src/css/', src: '**', dest: 'tessera/static/' }
        ]
      }
    },

    watch: {
      dep: {
        files: [
          'src/js/dependencies.js',
          'src/3rd-Party/**/*.*'
        ],
        tasks: ['dep']
      },
      app: {
        files: [
          'src/ts/**/*.ts',
          'src/templates/**/*.hbs',
          'src/css/*.css'
        ],
        tasks: ['app']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-ts-1.5');

  /** Compile the tessera source and templates */
  grunt.registerTask('app', [
    'ts', 'browserify:app', 'handlebars', 'concat:app', 'copy:app'
  ])

  /** Compile all third-party dependencies */
  grunt.registerTask('dep', [
    'browserify:dep', 'concat:dep_js', 'concat:dep_css', 'copy:dep'
  ]);

  /** Compile everything */
  grunt.registerTask('all', [
    'app', 'dep'
  ])

  /** By default */
  grunt.registerTask('default', [
    'all'
  ])
}
