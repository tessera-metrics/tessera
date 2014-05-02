ds.models.donut_chart = function(data) {
  "use strict";

  var query_name
    , chart
    , base
    , self = {};

  if (data) {
    query_name = data.query_name;
  }
  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_type('donut_chart').rebind(self);

  Object.defineProperty(self, 'query_name', {get: function() { return query_name; }});

  /**
   * Data mutators
   */

  self.set_query_name = function(_) {
    query_name = _;
    return self;
  }


 self.toJSON = function() {
    return chart.toJSON(base.toJSON({
      query_name: query_name
    }));
  }

  return self;
};
