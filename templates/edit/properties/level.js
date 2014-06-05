ds.templates.edit.properties.level.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.level,
            success: function(ignore, newValue) {
                item.level = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
