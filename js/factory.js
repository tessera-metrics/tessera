ds.register_dashboard_item = function(item_type, descriptor) {
  ds.models[item_type] = descriptor
  if (descriptor.template && (typeof(descriptor.template) === 'string')) {
    descriptor.template = Handlebars.compile(descriptor.template)
  }

  var props = (descriptor.interactive_properties || []).map(function(p) {
                if (typeof(p) === 'string') {
                  var prop = ds.property.get(p)
                  return prop || ds.property({id: p})
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
  var item_type = null
    , item = null

  if (typeof(data) === 'string' && ds.models[data]) {
    item_type = ds.models[data]
    item = ( item_type.constructor ) ? item_type.constructor() : item_type()
  } else if (data.is_dashboard_item) {
    item = data;
  } else if (data.item_type && ds.models[data.item_type]) {
    item_type = ds.models[data.item_type]
    if (item_type instanceof Function) {
      item = item_type(data)
    } else if (item_type.constructor) {
      item = item_type.constructor(data)
    }
  }
  if (item) {
    if (item_type) {
      item.interactive_properties = item_type.interactive_properties
    }
    return item
  }
  console.log('Unknown type');
  console.log(data);
  return null;
}

ds.models.make = ds.models.factory
