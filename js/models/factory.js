ds.models.factory = function(data) {
  if (data.type && typeof(data.type) == 'function') {
    return data;
  } else if (data.item_type && ds.models[data.item_type]) {
    return ds.models[data.item_type](data);
  } else {
    console.log('Unknown type');
    console.log(data);
    return null;
  }
}
