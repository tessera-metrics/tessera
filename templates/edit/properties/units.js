ds.templates.edit.properties.units = {
  editHandler: function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
                item.units = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
