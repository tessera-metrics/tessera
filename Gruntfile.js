module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    handlebars: {
      all: {
        options: {
          namespace: function(filename) {
            return 'ds.' + path.dirname(filename).replace('/', '.');
          },
          processName: function(filename) {
            var pieces = filename.split('/');
            return pieces[pieces.length - 1].split('.')[0];
          }
        },
        files: {
          'cronenberg/static/templates.js' : [ 'templates/**/*.hbs']
        }
      }
    },
    concat: {
      bundle_css: {
        src: [
          'cronenberg/static/css/bootstrap.css',
          'cronenberg/static/css/bootstrap-callouts.css',
          'cronenberg/static/css/bootstrap-editable.css',
          'cronenberg/static/css/bootstrapValidator.min.css',
          'cronenberg/static/css/font-awesome.css',
          'cronenberg/static/css/nv.d3.css'
        ],
        dest: 'cronenberg/static/css/bundle.css'
      },
      bundle: {
        options: {
          separator: ';'
        },
        src: [
          'cronenberg/static/js/jquery-1.11.0.min.js',
          'cronenberg/static/js/moment.min.js',
          'cronenberg/static/js/marked.min.js',
          'cronenberg/static/js/highlight.pack.js',
          'cronenberg/static/js/bean.min.js',
          'cronenberg/static/js/URI.min.js',
          'cronenberg/static/js/handlebars.min.js',
          'cronenberg/static/js/bootstrap.min.js',
          'cronenberg/static/js/bootbox.min.js',
          'cronenberg/static/js/d3.min.js',
          'cronenberg/static/js/nv.d3.min.js',
          'cronenberg/static/js/tagmanager.js',
          'cronenberg/static/js/bootstrap-editable.min.js',
          'cronenberg/static/js/bootstrap-growl.min.js',
          'cronenberg/static/js/bootstrapValidator.min.js',
          'cronenberg/static/js/limivorous.js',
          'cronenberg/static/js/color-0.5.0.js',
          'cronenberg/static/js/flot/jquery.flot.js',
          'cronenberg/static/js/flot/jquery.flot.time.js',
          'cronenberg/static/js/flot/jquery.flot.multihighlight.js',
          'cronenberg/static/js/flot/jquery.flot.tooltip.js',
          'cronenberg/static/js/flot/jquery.flot.stack.js',
          'cronenberg/static/js/flot/jquery.flot.crosshair.js'
        ],
        dest: 'cronenberg/static/bundle.js'
      },
      app: {
        options: {
          separator: ';'
        },
        src: [
          'js/core.js',
          'js/app.js',
          'js/app/manager.js',
          'js/app/helpers.js',
          'js/charts.js',
          'js/charts/graphite.js',
          'js/charts/nvd3.js',
          'js/charts/flot.js',
          'js/charts/impl.js',
          'js/app/actions.js',
          'js/models/**/*.js',
          'js/extensions/**/*.js',
          'js/app/handlers/*.js',
          'cronenberg/static/templates.js',
          'templates/**/*.js'
        ],
        dest: 'cronenberg/static/app.js'
      }
    },
    watch: {
      files: [
        'js/**/*.js',
        'templates/**/*.hbs',
        'templates/**/*.js',
        'cronenberg/static/js/**/*.js',
        'cronenberg/static/cronenberg.css'
      ],
      tasks: ['handlebars', 'concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['handlebars', 'concat']);
}
