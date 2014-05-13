$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  switch (this.getAttribute('data-ds-action')) {

    case 'time-spans': {
      ds.manager.apply_transform(ds.models.transform.TimeSpans(), item)
      break;
    }

    case 'time-shifts': {
      ds.manager.apply_transform(ds.models.transform.TimeShift(), item)
      break;
    }

    case 'isolate': {
      ds.manager.apply_transform(ds.models.transform.Isolate(), item)
      break;
    }

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

    case 'export-csv': {
      var data_url = ds.charts.chart_url(item, { showTitle: true, format: 'csv' });
      window.open(data_url);
      break;
    }

    case 'set-chart-type-stacked-area-chart': {
      item.set_item_type('stacked_area_chart')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-standard-time-series': {
      item.set_item_type('standard_time_series')
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series': {
      item.set_item_type('simple_time_series')
      item.filled = false
      ds.manager.update_item_view(item)
      break;
    }

    case 'set-chart-type-simple-time-series-filled': {
      item.set_item_type('simple_time_series')
      item.filled = true
      ds.manager.update_item_view(item)
      break;
    }

    case 'view-definition': {
      var contents = ds.templates.edit.item_source({item:item})
      bootbox.alert(contents)
      break;
    }

  }
  /* prevents resetting scroll position */
  return false
});
