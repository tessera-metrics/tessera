ds.templates.models.simple_time_series.dataHandler =
    function(query, item) {
        ds.charts.simple_area_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
    }
