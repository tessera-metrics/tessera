
/**
 * Handler for dashboard listing menu.
 */
cronenberg.dashboards.onDashboardListLoaded(function(data) {
  $('ul.ds-dashboard-action-menu li').click(function(event) {
    var action = this.getAttribute('data-ds-action');
    var href = $(event.target).parent().parent()[0].getAttribute('data-ds-href');
    switch (action) {
      case 'open':
        window.location = $(event.target).parent().parent()[0].getAttribute('data-ds-view-href');
      break;
      case 'duplicate':
        // TODO - should have dynamic refresh instead of setting window.location
        cronenberg.dashboards.duplicate(href, function() {
          window.location.reload();
        });
        break;
      case 'delete':
        cronenberg.dashboards.delete_with_confirmation(href, function() {
          window.location.reload();
        });
        break;
    }
  });
});

/**
 * Handler for presentation action menu
 */
cronenberg.dashboards.onDashboardLoaded(function(d) {
      $('ul.ds-action-menu li').click(function(event) {
          var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
          var item = cronenberg.dashboards.current.findPresentationForElement(presentation_id);
          switch (this.getAttribute('data-ds-action')) {
          case 'open-in-graphite':
              var composer_url = cronenberg.charts.composer_url(item, { showTitle: true });
              window.open(composer_url);
              break;
          case 'export-png':
              var image_url = cronenberg.charts.chart_url(item, { showTitle: true });
              window.open(image_url);
              break;
          case 'export-svg':
              var image_url = cronenberg.charts.chart_url(item, { showTitle: true, format: 'svg' });
              window.open(image_url);
              break;
          }
      });
  });
