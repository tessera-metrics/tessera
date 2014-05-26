ds.templates.models.singlegraph.dataHandler =
    function(query, item) {
        if (!item.interactive) {
            var element = $('#' + item.item_id + ' .ds-graph-holder');
            var png_url = ds.charts.graphite.chart_url(item, {
                height: element.height(),
                width: element.width()
            });
            element.html($('<img/>').attr('src', png_url));
        } else {
            ds.charts.simple_area_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query);
        }
        item.options.margin = { top: 0, left: 0, bottom: 0, right: 0 };
        var label = query.data[item.index || 0].key;
        var value = query.summation[item.transform];
        if (item.index) {
            value = query.data[item.index].summation[item.transform];
        }
        // TODO - the thresholding will probably mess up this one
        cronenberg.check_thresholds(item, value, '#' + item.item_id);
        $('#' + item.item_id + ' span.value').text(d3.format(item.format)(value));
        $('#' + item.item_id + ' span.ds-label').text(label);
    };
