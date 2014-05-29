ds.templates.models.standard_time_series.dataHandler =
  function(query, item) {
      var renderer = item.interactive
          ? ds.charts
          : ds.charts.graphite
      renderer.standard_line_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  }
