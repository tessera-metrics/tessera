ds.models.singlegraph = function(data) {
  "use strict";

  var format = ',.1s'
    , transform = 'mean'
    , chart
    , base
    , self = {};

  if (data) {
    format = data.format || format;
    transform = data.transform || transform;
  }
  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_type('singlegraph').rebind(self);

  Object.defineProperty(self, 'format', {get: function() { return format; }});
  Object.defineProperty(self, 'transform', {get: function() { return transform; }});

  /**
   * Data accessors
   */

  self.set_format = function(_) {
    format = _;
    return self;
  }

  self.set_transform = function(_) {
    transform = _;
    return self;
  }

 self.toJSON = function() {
    return chart.toJSON(base.toJSON({
      format: format,
      transform: transform
    }));
  }

  return self;
};
