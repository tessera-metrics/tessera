ds.templates.models.donut_chart.dataHandler =
    function(query, item) {
        ds.charts.donut_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query)
    }
