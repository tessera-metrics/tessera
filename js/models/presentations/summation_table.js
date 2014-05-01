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
    base = ds.models.item(data);
  } else {
    base = ds.models.item();
  }
  base.type('summation_table');

  item.base = base;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  /**
   * Data accessors
   */

  item.query_name = function(_) {
    if (!arguments.length) return query_name;
    query_name = _;
    return item;
  }

  item.striped = function(_) {
    if (!arguments.length) return striped;
    striped = _;
    return item;
  }

  item.format = function(_) {
    if (!arguments.length) return format;
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
