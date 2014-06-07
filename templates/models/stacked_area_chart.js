ds.templates.models.stacked_area_chart.dataHandler =
    function(query, item) {
        ds.charts.stacked_area_chart($('#' + item.item_id + ' .ds-graph-holder'), item, query)
    }
