ds.templates.models.singlegraph.dataHandler =
    function(query, item) {
        ds.charts.simple_area_chart($("#" + item.item_id + ' .ds-graph-holder'), item, query)
        item.options.margin = { top: 0, left: 0, bottom: 0, right: 0 }
        var label = query.data[item.index || 0].key
        var value = query.summation[item.transform]
        if (item.index) {
            value = query.data[item.index].summation[item.transform]
        }
        $('#' + item.item_id + ' span.value').text(d3.format(item.format)(value))
        $('#' + item.item_id + ' span.ds-label').text(label)
    }
