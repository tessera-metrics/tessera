ds.templates.edit.properties.index.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.index,
            success: function(ignore, newValue) {
                item.index = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
