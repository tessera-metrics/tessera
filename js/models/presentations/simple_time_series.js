ds.models.simple_time_series = function(data) {
  "use strict";

  var filled = false
    , chart
    , base
    , self = {};

  if (data) {
    filled = data.filled !== false;
  }
  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_item_type('simple_time_series').rebind(self);

  Object.defineProperty(self, 'filled', {get: function() { return filled; }});

  /**
   * Data accessors
   */

  self.set_filled = function(_) {
    filled = _;
    return self;
  }

  self.toJSON = function() {
    return chart.toJSON(base.toJSON({
      filled: filled
    }));
  }

  return self;
};
