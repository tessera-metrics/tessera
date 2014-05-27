ds.templates.models.simple_time_series.dataHandler =
    function(query, item) {
        if (!item.interactive) {
            var element = $('#' + item.item_id + ' .ds-graph-holder');
            var png_url = ds.charts.graphite.chart_url(item, {
                height: element.height(),
                width: element.width()
            });
            element.html($('<img/>').attr('src', png_url));
        } else {
            if (item.filled) {
              ds.charts.simple_area_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query);
            } else {
              ds.charts.simple_line_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query);
            }
        }
    };
