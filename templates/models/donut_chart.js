ds.templates.models.donut_chart.dataHandler =
    function(query, item) {
        var chart = cronenberg.charts.donut_chart($("#" + item.item_id + ' .ds-graph-holder'), query.data, item.options);
    };
