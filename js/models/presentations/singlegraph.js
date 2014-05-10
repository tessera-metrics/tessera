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
  base = ds.models.item(data).set_item_type('singlegraph').rebind(self);

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
   var data = chart.toJSON(base.toJSON())
   if (format)
     data.format = format
   if (transform)
     data.transform = transform
   return data
 }

  return self;
};
