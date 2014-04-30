module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    handlebars: {
      all: {
        options: {
          namespace: function(filename) {
            var names = filename.replace(/js\/(.*)(\/\w+\.hbs)/, '$1');
            return 'ds.templates.' + names.split('/').join('.');
          },
          processName: function(filePath) {
            return filePath
                   .replace(/js\/(.*)\//, '')
                   .replace(/\.hbs$/, '');
          }
        },
        files: {
          'cronenberg/static/templates.js' : [ 'js/**/*.hbs']
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      bundle: {
        src: [
          'cronenberg/static/js/jquery-1.11.0.min.js',
          'cronenberg/static/js/moment.min.js',
          'cronenberg/static/js/markdown.min.js',
          'cronenberg/static/js/bean.min.js',
          'cronenberg/static/js/URI.min.js',
          'cronenberg/static/js/handlebars.min.js',
          'cronenberg/static/js/bootstrap.min.js',
          'cronenberg/static/js/bootbox.min.js',
          'cronenberg/static/js/d3.min.js',
          'cronenberg/static/js/nv.d3.min.js',
          'cronenberg/static/js/tagmanager.js',
          'cronenberg/static/js/bootstrap-editable.min.js'
        ],
        dest: 'cronenberg/static/bundle.js'
      },
      app: {
        src: [
          'js/app/cronenberg.js',
          'js/app/cronenberg-queries.js',
          'js/app/cronenberg-charts.js',
          'js/app/cronenberg-dashboards.js',
          'js/app/cronenberg-templates.js',
          'js/core.js',
          'js/models/*.js',
          'js/models/presentations/*.js',
          'js/models/layouts/*.js',
          'cronenberg/static/templates.js'
        ],
        dest: 'cronenberg/static/app.js'
      }
    },
    watch: {
      files: [
        'js/**/cron*.js',
        'js/**/cron*.hbs',
        'cronenberg/static/js/**/*.js'
      ],
      tasks: ['handlebars', 'concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['handlebars', 'concat']);
}
