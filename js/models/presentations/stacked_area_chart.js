ds.models.stacked_area_chart = function(data) {
  "use strict";

  var chart
    , base
    , self = {};

  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_type('stacked_area_chart').rebind(self);

 self.toJSON = function() {
   return chart.toJSON(base.toJSON({
   }));
 }

  return self;
};
