module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

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
          'tessera/static/templates.js' : [ 'templates/**/*.hbs']
        }
      }
    },
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
          'tessera/static/js/usertiming.js'
        ],
        dest: 'tessera/static/bundle.js'
      },
      app: {
        options: {
          separator: ';'
        },
        src: [
          'js/core/core.js',
          'js/core/log.js',
          'js/core/perf.js',
          'js/core/event.js',
          'js/core/registry.js',
          'js/core/action.js',
          'js/dashboard/transform.js',
          'js/app/app.js',
          'js/app/manager.js',
          'js/app/helpers.js',
          'js/app/keybindings.js',
          'tessera/static/templates.js',
          'js/charts/charts.js',
          'js/charts/provider.js',
          'js/charts/graphite.js',
          'js/charts/flot.js',
          'js/app/actions.js',
          'js/edit/property.js',
          'js/dashboard/factory.js',
          'js/dashboard/properties.js',
          'js/dashboard/mixins/**/*.js',
          'js/dashboard/models/**/*.js',
          'js/extensions/**/*.js',
          'js/edit/edit-mode.js',
          'js/app/handlers/*.js'
        ],
        dest: 'tessera/static/app.js'
      }
    },
    watch: {
      files: [
        'js/**/*.js',
        'templates/**/*.hbs',
        'tessera/static/js/**/*.js',
        'tessera/static/css/**/*.css',
        'tessera/static/tessera.css',
        'tessera/static/tessera-typography.css'
      ],
      tasks: ['handlebars', 'concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['handlebars', 'concat']);
}
