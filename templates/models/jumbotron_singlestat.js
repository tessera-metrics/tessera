ds.templates.models.jumbotron_singlestat.dataHandler =
    function(query, item) {
        var element = $('#' + item.item_id + ' span.value');
        var value = query.summation[item.transform];
        if (item.index) {
            value = query.data[item.index].summation[item.transform];
        }
        $(element).text(d3.format(item.format)(value));
    };
