ds.templates.models.standard_time_series.dataHandler =
    function(query, item) {
        ds.charts.standard_line_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
    }
