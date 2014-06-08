ds.templates.models.simple_time_series.dataHandler =
    function(query, item) {
        if (item.filled) {
            ds.charts.simple_area_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
        } else {
            ds.charts.simple_line_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
        }
    }
