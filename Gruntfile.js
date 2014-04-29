module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

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
          'cronenberg/static/js/tagmanager.js'
        ],
        dest: 'cronenberg/static/bundle.js'
      },
      app: {
        src: [
          'cronenberg/static/cronenberg.js',
          'cronenberg/static/cronenberg-queries.js',
          'cronenberg/static/cronenberg-charts.js',
          'cronenberg/static/cronenberg-dashboards.js',
          'cronenberg/static/cronenberg-templates.js'
        ],
        dest: 'cronenberg/static/app.js'
      }
    },
    watch: {
      files: [
        'cronenberg/static/cron*.js',
        'cronenberg/static/js/*.js'
      ],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['concat']);
}
