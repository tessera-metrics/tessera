ds.templates.edit.properties.layout.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'select',
            source: [
                { value: undefined, text: 'none' }
            ].concat(Object.keys(ds.models.section.Layout).map(function(k) {
                var value = ds.models.section.Layout[k]
                return { value: value, text: value }
            })),
            value: item.style
        })
    }
