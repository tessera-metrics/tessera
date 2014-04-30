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
          'js/models/item.js',
          'js/models/container.js',
          'js/models/factory.js',
          'js/models/thresholds.js',
          'js/models/tag.js',
          'js/models/dashboard.js',
          'js/models/dashboard_definition.js',
          'js/models/presentations/chart.js',
          'js/models/presentations/singlestat.js',
          'js/models/presentations/jumbotron_singlestat.js',
          'js/models/presentations/summation_table.js',
          'js/models/presentations/simple_time_series.js',
          'js/models/presentations/standard_time_series.js',
          'js/models/presentations/stacked_area_chart.js',
          'js/models/presentations/donut_chart.js',
          'js/models/presentations/single_graph.js',
          'js/models/layouts/heading.js',
          'js/models/layouts/markdown.js',
          'js/models/layouts/cell.js',
          'js/models/layouts/row.js',
          'js/models/layouts/separator.js',
          'js/models/layouts/section.js',
          'js/models/layouts/dashboard_definition.js'
        ],
        dest: 'cronenberg/static/app.js'
      }
    },
    handlebars: {
    },
    watch: {
      files: [
        'cronenberg/static/cron*.js',
        'cronenberg/static/js/**/*.js'
      ],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['handlebars', 'concat']);
}
