ds.templates.edit.properties.format = {
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
                item.format = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
