ds.templates.models.singlegraph.dataHandler =
    function(query, item) {
        if (!item.interactive) {
            var element = $('#' + item.element_id + ' svg');
            var png_url = cronenberg.charts.chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            element.parent().html($('<img/>').attr('src', png_url));
        } else {
            cronenberg.charts.simple_area_chart($("#" + item.element_id + ' .ds-graph-holder'), query.data[0], item.options);
        }
        item.options.margin = { top: 0, left: 0, bottom: 0, right: 0 };
        var label = query.data[item.index || 0].key;
        var value = query.summation[item.transform];
        if (item.index) {
            value = query.data[item.index].summation[item.transform];
        }
        // TODO - the thresholding will probably mess up this one
        cronenberg.check_thresholds(item, value, '#' + item.element_id);
        $('#' + item.element_id + ' span.value').text(d3.format(item.format)(value));
        $('#' + item.element_id + ' span.ds-label').text(label);
    };
