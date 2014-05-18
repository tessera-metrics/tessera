ds.templates.models.stacked_area_chart.dataHandler
    = function(query, item) {
        if (!item.interactive) {
            var element = $('#' + item.item_id + ' svg');
            var png_url = ds.charts.graphite.chart_url(item, {
                height: element.height(),
                width: element.width()
            });
            element.parent().html($('<img/>').attr('src', png_url));
        } else {
            ds.charts.stacked_area_chart($("#" + item.item_id + ' .ds-graph-holder'), query.data, item.options);
        }
    };
