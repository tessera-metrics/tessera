ds.templates.models.donut_chart.dataHandler =
    function(query, item) {
        var chart = ds.charts.donut_chart($("#" + item.item_id + ' .ds-graph-holder'), query.data, item.options);
    };
