ds.templates.edit.properties.height.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'number',
            value: item.height
        })
    }
