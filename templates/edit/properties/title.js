ds.templates.edit.properties.title.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
                item.title = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
