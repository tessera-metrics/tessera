ds.templates.edit.properties.transform = {
  editHandler:
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'select',
            source: [
                { value: undefined, text: 'none' }
            ].concat(Object.keys(ds.models.item.Transform).map(function(k) {
                var value = ds.models.item.Transform[k]
                return { value: value, text: value }
            })),
            value: item.transform,
            success: function(ignore, newValue) {
                item.transform = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
