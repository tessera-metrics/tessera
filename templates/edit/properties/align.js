ds.templates.edit.properties.align = {
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'select',
            source: [
              { value: undefined, text: 'none' },
              { value: 'left', text: 'left' },
              { value: 'center', text: 'center' },
              { value: 'right', text: 'right' }
            ],
            value: item.style,
            success: function(ignore, newValue) {
                item.align = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
