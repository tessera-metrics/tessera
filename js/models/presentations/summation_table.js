ds.models.summation_table = function(data) {
  "use strict";

  var query_name
    , striped
    , format = ',.3f'
    , base
    , self = {};

  if (data) {
    query_name = data.query_name;
    striped = data.striped !== false
    format = data.format || format;
  }
  base = ds.models.item(data).set_type('summation_table').rebind(self);

  Object.defineProperty(self, 'query_name', {get: function() { return query_name; }});
  Object.defineProperty(self, 'striped', {get: function() { return striped; }});
  Object.defineProperty(self, 'format', {get: function() { return format; }});

  /**
   * Data mutators
   */

  self.set_query_name = function(_) {
    query_name = _;
    return self;
  }

  self.set_striped = function(_) {
    striped = _;
    return self;
  }

  self.set_format = function(_) {
    format = _;
    return self;
  }

  self.toJSON = function() {
    return base.toJSON({
      format: format,
      query_name: query_name
    });
  }

  return self;
}
