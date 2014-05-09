$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  switch (this.getAttribute('data-ds-action')) {

    case 'open-in-graphite': {
      var composer_url = ds.charts.composer_url(item, { showTitle: true });
      window.open(composer_url);
      break;
    }

    case 'export-png': {
      var image_url = ds.charts.chart_url(item, { showTitle: true });
      window.open(image_url);
      break;
    }

    case 'export-svg': {
      var image_url = ds.charts.chart_url(item, { showTitle: true, format: 'svg' });
      window.open(image_url);
      break;
    }

    case 'set-chart-type-stacked-area-chart': {
      item.set_type('stacked_area_chart')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-standard-time-series': {
      item.set_type('standard_time_series')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series': {
      item.set_type('simple_time_series')
      item.filled = false
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series-filled': {
      item.set_type('simple_time_series')
      item.filled = true
      ds.manager.update_item_view(item)
      break;
    }

  }
  /* prevents resetting scroll position */
  return false
});
