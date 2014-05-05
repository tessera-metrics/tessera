ds.templates.models.singlestat.dataHandler =
    function(query, item) {
        var element = $('#' + item.item_id + ' span.value');
        var value = query.summation[item.transform];
        if (item.index) {
            value = query.data[item.index].summation[item.transform];
        }
        cronenberg.check_thresholds(item, value, '#' + item.item_id);
        element.text(d3.format(item.format)(value));
    };
