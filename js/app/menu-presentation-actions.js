cronenberg.dashboards.onDashboardLoaded(function(d) {
      $('ul.ds-action-menu li').click(function(event) {
          var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
          var item = cronenberg.dashboards.current.findPresentationForElement(presentation_id);
        var query = cronenberg.dashboards.current.findQueryForPresentation(item);
          switch (this.getAttribute('data-ds-action')) {
          case 'open-in-graphite':
              var composer_url = cronenberg.charts.composer_url(item, query, { showTitle: true });
              window.open(composer_url);
              break;
          case 'export-png':
              var image_url = cronenberg.charts.chart_url(item, query, { showTitle: true });
              window.open(image_url);
              break;
          case 'export-svg':
              var image_url = cronenberg.charts.chart_url(item, query, { showTitle: true, format: 'svg' });
              window.open(image_url);
              break;
          }
      });
  });
