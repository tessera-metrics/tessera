ds.templates.edit.properties.css_class.editHandler =
    function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'text'
        })
    }
