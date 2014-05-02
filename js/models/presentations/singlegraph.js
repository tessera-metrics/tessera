ds.models.singlegraph = function(data) {
  "use strict";

  var query_name
    , format = ',.1s'
    , transform = 'mean'
    , chart
    , base
    , self = {};

  if (data) {
    query_name = data.query_name;
    format = data.format || format;
    transform = data.transform || transform;
  }
  chart = ds.models.chart(data).rebind(self);
  base = ds.models.item(data).set_type('singlegraph').rebind(self);

  Object.defineProperty(self, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(self, 'format', {get: function() { return format; }});
  Object.defineProperty(self, 'transform', {get: function() { return transform; }});

  /**
   * Data accessors
   */

  self.set_query_name = function(_) {
    query_name = _;
    return self;
  }

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
      query_name: query_name,
      format: format,
      transform: transform
    }));
  }

  return self;
};
