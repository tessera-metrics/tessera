ds.templates.edit.properties.markdown_text.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'textarea',
            success: function(ignore, newValue) {
                item.text = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
