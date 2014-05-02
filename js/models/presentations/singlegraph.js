ds.models.singlegraph = function(data) {
  "use strict";

  var query_name
    , format = ',.1s'
    , transform = 'mean'
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    format = data.format || format;
    transform = data.transform || transform;
  }
  chart = ds.models.chart(data).rebind(item);
  base = ds.models.item(data).set_type('singlegraph').rebind(item);

  Object.defineProperty(item, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(item, 'format', {get: function() { return format; }});
  Object.defineProperty(item, 'transform', {get: function() { return transform; }});

  /**
   * Data accessors
   */

  item.set_query_name = function(_) {
    query_name = _;
    return item;
  }

  item.set_format = function(_) {
    format = _;
    return item;
  }

  item.set_transform = function(_) {
    transform = _;
    return item;
  }

 item.toJSON = function() {
    return chart.toJSON(base.toJSON({
      query_name: query_name,
      format: format,
      transform: transform
    }));
  }

  return item;
};
