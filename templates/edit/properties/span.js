ds.templates.edit.properties.span.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.span,
            success: function(ignore, newValue) {
                item.span = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
