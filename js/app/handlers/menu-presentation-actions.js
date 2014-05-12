$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
  var item = ds.manager.current.dashboard.get_item(presentation_id);

  switch (this.getAttribute('data-ds-action')) {

    case 'time-spans': {
      // TODO: this should all be tidied up and moved into the
      // manager, and integrate with browser history
      var new_item = ds.models.transform.TimeSpans().transform(item)
      var dashboard = ds.manager.current.dashboard
      dashboard.set_items([new_item])
      $('#' + dashboard.definition.item_id).replaceWith(dashboard.render())

      var queries = {}
      new_item.visit(function(i) {
        if (i.query) {
          queries[i.query.name] = i.query
        }
      })

      dashboard.definition.queries = queries
      dashboard.load_all()

      break;
    }

    case 'time-shifts': {
      // TODO: this should all be tidied up and moved into the
      // manager, and integrate with browser history
      var new_item = ds.models.transform.TimeShift().transform(item)
      var dashboard = ds.manager.current.dashboard
      dashboard.set_items([new_item])
      $('#' + dashboard.definition.item_id).replaceWith(dashboard.render())

      var queries = {}
      new_item.visit(function(i) {
        if (i.query) {
          queries[i.query.name] = i.query
        }
      })

      dashboard.definition.queries = queries
      dashboard.load_all()

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
