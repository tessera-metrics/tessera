ds.templates.edit.properties.description.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
                item.description = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
