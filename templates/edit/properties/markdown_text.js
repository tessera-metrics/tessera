ds.templates.edit.properties.markdown_text = {
    template: Handlebars.compile('<span class="ds-source">{{item.text}}</span>'),
    editHandler: function(property, item) {
        $('#' + item.item_id + property.name).editable({
            type: 'textarea',
            value: item.text || '',
            success: function(ignore, newValue) {
                item.text = newValue
                ds.manager.update_item_view(item)
            }
        })
    }
}
