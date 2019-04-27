const sass = require('node-sass');

module.exports = function(grunt) {
  var path = require('path');

  var SOURCE_FILES = [
    'src/ts/**/*.ts',
    '!src/ts/types/**'
  ]

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    DIST: '../tessera-server/tessera/static',

    /**
     * 1 - Transpile all TypeScript sources to ES6
     */
    ts: {
      default: {
        src: SOURCE_FILES,
        outDir: '_build/phase1',
        options: {
          rootDir: 'src',
          target: 'es6',
          comments: true,
          declaration: true,
          sourceMap: true,
          moduleResolution: 'node'
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
            ['babelify', {
              presets: [
                'es2015', 'stage-0'
              ]
            }]
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
     * 3b - compile the SCSS source to CSS
     */
    sass: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      dist: {
        files: {
          '_build/css/tessera.css':                'src/css/tessera.scss',
          '_build/css/tessera-typography.css':     'src/css/tessera-typography.scss',
          '_build/css/themes/bootstrap-dark.css':  'src/css/themes/bootstrap-dark.scss',
          '_build/css/themes/tessera-dark.css':    'src/css/themes/tessera-dark.scss',
          '_build/css/themes/bootstrap-light.css': 'src/css/themes/bootstrap-light.scss',
          '_build/css/themes/tessera-light.css':   'src/css/themes/tessera-light.scss',
          '_build/css/themes/bootstrap-snow.css':  'src/css/themes/bootstrap-snow.scss',
          '_build/css/themes/tessera-snow.css':     'src/css/themes/tessera-snow.scss',
          '_build/css/themes/tessera-solarized-light.css': 'src/css/themes/tessera-solarized-light.scss',
          '_build/css/themes/tessera-solarized-dark.css':  'src/css/themes/tessera-solarized-dark.scss'
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
        dest: '<%= DIST %>/css/bundle.css'
      },
      dep_js: {
        options: {
          separator: ';'
        },
        src: [
          '_build/dependencies.js',
          'node_modules/d3-format/dist/d3-format.js',
          'node_modules/d3-shape/dist/d3-shape.js',
          'node_modules/flot/dist/es5/jquery.flot.js',
          'node_modules/flot/source/jquery.flot.pie.js',
          'node_modules/flot/source/jquery.flot.resize.js',
          'node_modules/flot-d3-stack/jquery.flot.d3.stack.js',
          'src/3rd-Party/js/tagmanager.js',
          'src/3rd-Party/js/bootstrap-editable.min.js',
          'src/3rd-Party/js/bootstrap-datetimepicker.min.js',
          'src/3rd-Party/js/bootstrapValidator.min.js',
          'src/3rd-Party/js/flot/jquery.flot.multihighlight.js',
          'src/3rd-Party/js/flot/jquery.flot.crosshair.js',
          'src/3rd-Party/js/flot/jquery.flot.downsample.js',
          'src/3rd-Party/js/flot/jquery.flot.valuelabels.js',
          'src/3rd-Party/js/flot/jquery.flot.barnumbers.enhanced.js',
          'src/3rd-Party/js/equalize.min.js'
        ],
        dest: '<%= DIST %>/bundle.js'
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
        dest: '<%= DIST %>/tessera.js'
      }
    },

    /**
     * 5 - Copy sources to the static resources dir.
     */
    copy: {
      dep: {
        files: [
          { expand: true, cwd: 'src/3rd-Party/fonts/', src: '**', dest: '<%= DIST %>/fonts/' },
          { expand: true, cwd: 'src/3rd-Party/img/', src: '**', dest: '<%= DIST %>/img/' },
          {
            expand: true, cwd: 'src/3rd-Party/css/', src: [
              '*.gif', '*.png', '*.map'
            ],
            dest: '<%= DIST %>/css'
          }
        ]
      },
      app: {
        files: [
          { expand: true, cwd: 'node_modules/bootstrap-solarized/', src: '*.css', dest: '<%= DIST %>/themes/' },
          { expand: true, cwd: '_build/css/', src: '**', dest: '<%= DIST %>/' }
        ]
      }
    },

    clean: {
      build: {
        src: [
          '_build/',
          '<%= DIST %>/*'
        ]
      }
    },

    watch: {
      dep: {
        files: [
          'src/js/dependencies.js',
          'src/3rd-Party/**/*.*',
          'node_modules/**/*.js',
          'Gruntfiles.js'
        ],
        tasks: ['dep']
      },
      app_templates: {
        files: [
          'src/templates/**/*.hbs'
        ],
        tasks: ['handlebars', 'concat:app', 'copy:app']
      },
      app_js: {
        files: [
          'src/ts/**/*.ts'
        ],
        tasks: ['app']
      },
      app_css: {
        files: [
          'src/css/**/*.scss'
        ],
        tasks: ['sass', 'copy:app']
      }
    },

    run: {
      screenshots: {
        options: {
          wait: true
        },
        args: [
          'screenshots.js'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-run');

  /** Compile the tessera source and templates */
  grunt.registerTask('app', [
    'ts', 'browserify:app', 'handlebars', 'sass', 'concat:app', 'copy:app'
  ])

  grunt.registerTask('css', [
    'sass', 'copy:app'
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
