ds.models.singlestat = function(data) {
  "use strict";

  var query_name
    , title
    , units
    , format=',.3f'
    , index
    , transform='mean'
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    title = data.title;
    units = data.units;
    format = data.format || format;
    index = data.index;
    transform = data.transform || transform;
  }
  base = ds.models.item(data).set_type('singlestat').rebind(item);

  Object.defineProperty(item, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(item, 'title', {get: function() { return title; }});
  Object.defineProperty(item, 'units', {get: function() { return units; }});
  Object.defineProperty(item, 'format', {get: function() { return format; }});
  Object.defineProperty(item, 'index', {get: function() { return index; }});
  Object.defineProperty(item, 'transform', {get: function() { return transform; }});

  /**
   * Data accessors
   */

  item.set_query_name = function(_) {
    query_name = _;
    return item;
  }

  item.set_title = function(_) {
    title = _;
    return item;
  }

  item.set_units = function(_) {
    units = _;
    return item;
  }

  item.set_format = function(_) {
    format = _;
    return item;
  }

  item.set_index = function(_) {
    index = _;
    return item;
  }

  item.set_transform = function(_) {
    transform = _;
    return item;
  }

 item.toJSON = function() {
    return base.toJSON({
      title: title,
      query_name: query_name,
      format: format,
      transform: transform,
      units: units,
      index: index
    });
  }

  return item;
}
