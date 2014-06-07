ds.templates.edit.properties.heading_text = {
  display: 'text',
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text',
            success: function(ignore, newValue) {
              console.log('heading_text.update: ' + newValue)
                item.text = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
