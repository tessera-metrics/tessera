
module.exports = function(grunt) {
  var path = require('path');

  var SOURCE_FILES = [
    'ts/dependencies.ts',
    'ts/core/core.ts',
    'ts/core/log.ts',
    'ts/core/perf.ts',
    'ts/core/event.ts',
    'ts/core/registry.ts',
    'ts/core/action.ts',
    'ts/models/transform.ts',
    'ts/app/app.ts',
    'ts/app/manager.ts',
    'ts/app/helpers.ts',
    'ts/app/keybindings.ts',
    'ts/charts/charts.ts',
    'ts/charts/provider.ts',
    'ts/charts/graphite.ts',
    'ts/charts/flot.ts',
    'ts/app/actions.ts',
    'ts/edit/property.ts',
    'ts/models/factory.ts',
    'ts/models/properties.ts',
    'ts/models/model.ts',
    'ts/models/item.ts',
    'ts/models/presentation.ts',
    'ts/models/table-presentation.ts',
    'ts/models/container.ts',
    'ts/models/chart.ts',
    'ts/models/axis.ts',
    'ts/models/tag.ts',
    'ts/models/thresholds.ts',
    'ts/models/data/Summation.ts',
    'ts/models/data/Query.ts',
    'ts/models/section.ts',
    'ts/models/row.ts',
    'ts/models/cell.ts',
    'ts/models/separator.ts',
    'ts/models/heading.ts',
    'ts/models/markdown.ts',
    'ts/models/singlestat.ts',
    'ts/models/jumbotron_singlestat.ts',
    'ts/models/summation_table.ts',
    'ts/models/comparison_summation_table.ts',
    'ts/models/timeshift_summation_table.ts',
    'ts/models/percentage_table.ts',
    'ts/models/singlegraph.ts',
    'ts/models/simple_time_series.ts',
    'ts/models/standard_time_series.ts',
    'ts/models/stacked_area_chart.ts',
    'ts/models/bar_chart.ts',
    'ts/models/discrete_bar_chart.ts',
    'ts/models/donut_chart.ts',
    'ts/models/dashboard_definition.ts',
    'ts/models/dashboard.ts',
    'ts/models/transform/*.ts',
    'ts/extensions/**/*.ts',
    'ts/edit/edit-mode.ts',
    'ts/app/handlers/*.ts'
  ]

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /**
     * 1 - Transpile all TypeScript sources to ES6
     */
    ts: {
      default: {
        src: SOURCE_FILES,
        out: '_build/app-es6.js',
        options: {
          target: 'es6'
        }
      }
    },

    /**
     * 2 - Convert the ES6 Javascript to ES5 Javascript, via babeljs.
     */
    babel: {
      options: {
        sourceMap: true,
        compact: false
      },
      dist: {
        files: {
          '_build/app-es5.js' : '_build/app-es6.js'
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
            return 'ds.' + path.dirname(filename).split('/').join('.')
          },
          processName: function(filename) {
            var pieces = filename.split('/')
            return pieces[pieces.length - 1].split('.')[0]
          }
        },
        files: {
          '_build/templates.js' : [ 'templates/**/*.hbs']
        }
      }
    },

    /**
     * 4 - Concatenate the transpiled sources, the precompiled
     * templates, and the babel polyfill required for all ES6 support.
     */
    concat: {
      bundle_css: {
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
      bundle: {
        options: {
          separator: ';'
        },
        src: [
          'tessera/static/js/jquery-1.11.2.min.js',
          'tessera/static/js/jquery.dataTables.min.js',
          'tessera/static/js/dataTables.bootstrap.min.js',
          'tessera/static/js/moment.min.js',
          'tessera/static/js/moment-timezone-with-data.min.js',
          'tessera/static/js/marked.min.js',
          'tessera/static/js/mousetrap.min.js',
          'tessera/static/js/highlight.pack.js',
          'tessera/static/js/bean.min.js',
          'tessera/static/js/URI.min.js',
          'tessera/static/js/handlebars.min.js',
          'tessera/static/js/bootstrap.min.js',
          'tessera/static/js/bootbox.min.js',
          'tessera/static/js/d3.min.js',
          'tessera/static/js/tagmanager.js',
          'tessera/static/js/select2.min.js',
          'tessera/static/js/bootstrap-editable.min.js',
          'tessera/static/js/bootstrap-growl.min.js',
          'tessera/static/js/bootstrap-datetimepicker.min.js',
          'tessera/static/js/bootstrapValidator.min.js',
          'tessera/static/js/limivorous.js',
          'tessera/static/js/color-0.7.1.js',
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
          'tessera/static/js/simple_statistics.js',
          'tessera/static/js/equalize.min.js',
          'tessera/static/js/usertiming.js',
          'tessera/static/js/inflection.min.js'
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
          '_build/app-es5.js'
        ],
        dest: 'tessera/static/app.js'
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
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-ts-1.5');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default', ['ts', 'babel', 'handlebars', 'concat']);
}
