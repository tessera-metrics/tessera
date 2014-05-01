ds.templates.models.summation_table.dataHandler
    = function(query, item) {
        var body = $('#' + item.element_id + ' tbody');
        query.data.forEach(function(series) {
            body.append(ds.templates.models.summation_table_row({series:series, item:item}));
        });
    };
