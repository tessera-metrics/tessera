ds.models.summation_table = function(data) {
  "use strict";

  var query_name
    , striped
    , format = ',.3f'
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    striped = data.striped !== false
    format = data.format || format;
  }
  base = ds.models.item(data).set_type('summation_table').rebind(item);

  Object.defineProperty(item, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(item, 'striped', {get: function() { return striped; }});
  Object.defineProperty(item, 'format', {get: function() { return format; }});

  /**
   * Data mutators
   */

  item.set_query_name = function(_) {
    query_name = _;
    return item;
  }

  item.set_striped = function(_) {
    striped = _;
    return item;
  }

  item.set_format = function(_) {
    format = _;
    return item;
  }

  item.toJSON = function() {
    return base.toJSON({
      format: format,
      query_name: query_name
    });
  }

  return item;
}
