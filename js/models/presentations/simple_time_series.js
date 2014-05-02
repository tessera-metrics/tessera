ds.models.simple_time_series = function(data) {
  "use strict";

  var query_name
    , filled = false
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
    filled = data.filled !== false;
  }
  chart = ds.models.chart(data).rebind(item);
  base = ds.models.item(data).set_type('simple_time_series').rebind(item);

  Object.defineProperty(item, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(item, 'filled', {get: function() { return filled; }});

  /**
   * Data accessors
   */

  item.set_query_name = function(_) {
    query_name = _;
    return item;
  }

  item.set_filled = function(_) {
    filled = _;
    return item;
  }

  item.toJSON = function() {
    return chart.toJSON(base.toJSON({
      filled: filled,
      query_name: query_name
    }));
  }

  return item;
};
