ds.templates.models.stacked_area_chart.dataHandler =
  function(query, item) {
      var renderer = item.interactive
          ? ds.charts
          : ds.charts.graphite
      renderer.stacked_area_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
  }
