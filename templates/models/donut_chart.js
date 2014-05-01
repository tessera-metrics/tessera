ds.templates.models.donut_chart.dataHandler =
    function(query, item) {
        var chart = cronenberg.charts.donut_chart($("#" + item.element_id + ' .ds-graph-holder'), query.data, item.options);
    };
