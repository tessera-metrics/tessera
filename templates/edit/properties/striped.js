ds.templates.edit.properties.striped = {
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'checklist',
            value: item.striped,
            source: [
                { value: true, text: "striped" }
            ],
            success: function(ignore, newValue) {
                item.striped = newValue.length > 0
                ds.manager.update_item_view(item)
            }
        })
    }
}
