ds.templates.edit.properties.style.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'select',
            source: [
                { value: undefined, text: 'none' }
            ].concat(Object.keys(ds.models.item.Style).map(function(k) {
                var value = ds.models.item.Style[k]
                return { value: value, text: value }
            })),
            value: item.style,
            success: function(ignore, newValue) {
                item.style = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
