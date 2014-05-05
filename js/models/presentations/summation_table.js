ds.models.summation_table = function(data) {
  "use strict";

  var striped
    , format = ',.3f'
    , base
    , self = {};

  if (data) {
    striped = data.striped !== false
    format = data.format || format;
  }
  base = ds.models.item(data).set_type('summation_table').rebind(self);

  Object.defineProperty(self, 'striped', {get: function() { return striped; }});
  Object.defineProperty(self, 'format', {get: function() { return format; }});
  Object.defineProperty(self, 'requires_data', {value: true});

  /**
   * Data mutators
   */

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
      format: format
    });
  }

  return self;
}
