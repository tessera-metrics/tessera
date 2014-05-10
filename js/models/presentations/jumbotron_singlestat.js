ds.models.jumbotron_singlestat = function(data) {
  "use strict";

  var base
    , self = {};

  base = ds.models.singlestat(data).set_item_type('jumbotron_singlestat');
  base._base.rebind(self);

  d3.rebind(self, base, 'set_title', 'set_units', 'set_format', 'set_index', 'set_transform', 'toJSON');
  ds.rebind_properties(self, base, 'title', 'units', 'format', 'index', 'transform');
  Object.defineProperty(self, 'requires_data', {value: true});

  return self;
}
