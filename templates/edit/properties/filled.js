ds.templates.edit.properties.filled = {
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'checklist',
            value: item.filled,
            source: [
                { value: true, text: "filled" }
            ],
            success: function(ignore, newValue) {
                item.filled = newValue.length > 0
                ds.manager.update_item_view(item)
            }
        })
    }
}
