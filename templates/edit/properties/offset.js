ds.templates.edit.properties.offset.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.offset
        })
    }
