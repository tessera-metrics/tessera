module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'cronenberg/static/js/jquery-1.11.0.min.js',
          'cronenberg/static/js/moment.min.js',
          'cronenberg/static/js/bean.min.js',
          'cronenberg/static/js/URI.min.js',
          'cronenberg/static/js/handlebars.min.js',
          'cronenberg/static/js/bootstrap.min.js',
          'cronenberg/static/js/bootbox.min.js',
          'cronenberg/static/js/d3.min.js',
          'cronenberg/static/js/nv.d3.min.js',
          'cronenberg/static/cronenberg.js',
          'cronenberg/static/cronenberg-queries.js',
          'cronenberg/static/cronenberg-charts.js',
          'cronenberg/static/cronenberg-dashboards.js',
          'cronenberg/static/cronenberg-templates.js'
        ],
        // the location of the resulting JS file
        dest: 'cronenberg/static/bundle.js'
      }
    },
    watch: {
      files: ['<%= concat.dist.src %>'],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
}
