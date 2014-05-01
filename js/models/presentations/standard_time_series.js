ds.models.standard_time_series = function(data) {
  "use strict";

  var query_name
    , chart
    , base
    , item = {};

  if (data) {
    query_name = data.query_name;
}
  chart = ds.models.chart(data).rebind(item);
  base = ds.models.item(data).set_type('standard_time_series').rebind(item);

  Object.defineProperty(item, 'query_name', {get: function() { return query_name; }});

  item.set_query_name = function(_) {
    query_name = _;
    return item;
  }

  item.toJSON = function() {
    return chart.toJSON(base.toJSON({
      query_name: query_name
    }));
  }

  return item;
};
