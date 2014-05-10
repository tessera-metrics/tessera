ds.models.standard_time_series = function(data) {
  "use strict";

  var chart
    , base
    , self = {};

  base = ds.models.item(data).set_item_type('standard_time_series').rebind(self);
  chart = ds.models.chart(data).rebind(self);

  self.toJSON = function() {
    return chart.toJSON(base.toJSON({
    }));
  }

  return self;
};
