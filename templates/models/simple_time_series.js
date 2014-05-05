ds.templates.models.simple_time_series.dataHandler =
    function(query, item) {
        if (!item.interactive) {
            var element = $('#' + item.item_id + ' svg');
            var png_url = cronenberg.charts.chart_url(item, {
                height: element.height(),
                width: element.width()
            });
            element.parent().html($('<img/>').attr('src', png_url));
        } else {
            if (item.filled) {
                cronenberg.charts.simple_area_chart($("#" + item.item_id + ' .ds-graph-holder'), query.data[0], item.options);
            } else {
                cronenberg.charts.simple_line_chart($("#" + item.item_id + ' .ds-graph-holder'), query.data[0], item.options);
            }
        }
    };
