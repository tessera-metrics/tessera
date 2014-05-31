ds.templates.models.summation_table.dataHandler
    = function(query, item) {
        var body = $('#' + item.item_id + ' tbody')
        body.empty()
        query.data.forEach(function(series) {
            body.append(ds.templates.models.summation_table_row({series:series, item:item}))
        })
    }
