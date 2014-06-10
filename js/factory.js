ds.register_dashboard_item = function(item_type, descriptor) {
  ds.models[item_type] = descriptor
  if (descriptor.template && (typeof(descriptor.template) === 'string')) {
    descriptor.template = Handlebars.compile(descriptor.template)
  }

  var props = (descriptor.interactive_properties || []).map(function(p) {
                if (typeof(p) === 'string') {
                  return ds.property({id: p})
                } else if (p.is_property) {
                  return p
                } else {
                  return ds.property(p)
                }
              })
  descriptor.interactive_properties = props

  return ds
}

ds.models.factory = function(data) {
  if (data.is_dashboard_item) {
    return data;
  } else if (data.item_type && ds.models[data.item_type]) {
    var item_type = ds.models[data.item_type]
    if (item_type instanceof Function) {
      return item_type(data)
    } else if (item_type.constructor) {
      return item_type.constructor(data)
    }
  }
  console.log('Unknown type');
  console.log(data);
  return null;
}
