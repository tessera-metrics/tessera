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
          'tessera/static/css/nv.d3.css'
        ],
        dest: 'tessera/static/css/bundle.css'
      },
      bundle: {
        options: {
          separator: ';'
        },
        src: [
          'tessera/static/js/jquery-1.11.0.min.js',
          'tessera/static/js/moment.min.js',
          'tessera/static/js/marked.min.js',
          'tessera/static/js/mousetrap.min.js',
          'tessera/static/js/highlight.pack.js',
          'tessera/static/js/bean.min.js',
          'tessera/static/js/URI.min.js',
          'tessera/static/js/handlebars.min.js',
          'tessera/static/js/bootstrap.min.js',
          'tessera/static/js/bootbox.min.js',
          'tessera/static/js/d3.min.js',
          'tessera/static/js/nv.d3.min.js',
          'tessera/static/js/tagmanager.js',
          'tessera/static/js/bootstrap-editable.min.js',
          'tessera/static/js/bootstrap-growl.min.js',
          'tessera/static/js/bootstrap-datetimepicker.min.js',
          'tessera/static/js/bootstrapValidator.min.js',
          'tessera/static/js/limivorous.js',
          'tessera/static/js/color-0.5.0.js',
          'tessera/static/js/flot/jquery.flot.js',
          'tessera/static/js/flot/jquery.flot.time.js',
          'tessera/static/js/flot/jquery.flot.multihighlight.js',
          'tessera/static/js/flot/jquery.flot.tooltip.js',
          'tessera/static/js/flot/jquery.flot.stack.js',
          'tessera/static/js/flot/jquery.flot.crosshair.js',
          'tessera/static/js/simple_statistics.js'
        ],
        dest: 'tessera/static/bundle.js'
      },
      app: {
        options: {
          separator: ';'
        },
        src: [
          'js/core.js',
          'js/registry.js',
          'js/action.js',
          'js/transform.js',
          'js/app.js',
          'js/app/manager.js',
          'js/app/helpers.js',
          'tessera/static/templates.js',
          'js/charts.js',
          'js/charts/graphite.js',
          'js/charts/nvd3.js',
          'js/charts/flot.js',
          'js/app/actions.js',
          'js/property.js',
          'js/factory.js',
          'js/app/properties.js',
          'js/mixins/**/*.js',
          'js/models/**/*.js',
          'js/extensions/**/*.js',
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
        'tessera/static/tessera.css'
      ],
      tasks: ['handlebars', 'concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['handlebars', 'concat']);
}
