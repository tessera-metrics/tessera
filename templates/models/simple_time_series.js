ds.templates.models.simple_time_series.dataHandler =
    function(query, item) {
        var element = $('#' + item.item_id + ' .ds-graph-holder')
        var renderer = item.interactive
            ? ds.charts
            : ds.charts.graphite
        if (item.filled) {
            renderer.simple_area_chart(element, item, query)
        } else {
            renderer.simple_line_chart(element, item, query)
        }
    }
