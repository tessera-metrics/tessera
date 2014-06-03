ds.templates.edit.properties.query.editHandler =
    function(property, item) {
        var queries = ds.manager.current.dashboard.definition.queries
        $('#' + item.item_id + property.name).editable({
            type: 'select',
            source: Object.keys(queries).map(function(k) {
                return { value: k, text: k }
            }),
            value: item.query ? item.query.name : undefined,
            success: function(ignore, newValue) {
                item.query = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
