ds.templates.edit.properties.markdown_text.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'textarea',
            success: function(ignore, newValue) {
              console.log('heading_text.update: ' + newValue)
                item.text = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
