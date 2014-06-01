ds.templates.edit.properties.offset.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.offset,
            success: function(ignore, newValue) {
                item.offset = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
