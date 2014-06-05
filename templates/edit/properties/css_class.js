ds.templates.edit.properties.css_class.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
                item.css_class = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
