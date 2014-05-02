ds.models.simple_time_series = function(data) {
  "use strict";

  var query_name
    , filled = false
    , chart
    , base
    , self = {};

  if (data) {
    query_name = data.query_name;
    filled = data.filled !== false;
  }
  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_type('simple_time_series').rebind(self);

  Object.defineProperty(self, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(self, 'filled', {get: function() { return filled; }});

  /**
   * Data accessors
   */

  self.set_query_name = function(_) {
    query_name = _;
    return self;
  }

  self.set_filled = function(_) {
    filled = _;
    return self;
  }

  self.toJSON = function() {
    return chart.toJSON(base.toJSON({
      filled: filled,
      query_name: query_name
    }));
  }

  return self;
};
