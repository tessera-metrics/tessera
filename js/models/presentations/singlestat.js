ds.models.singlestat = function(data) {
  "use strict";

  var title
    , units
    , format=',.3f'
    , index
    , transform='mean'
    , base
    , self = {};

  if (data) {
    title = data.title;
    units = data.units;
    format = data.format || format;
    index = data.index;
    transform = data.transform || transform;
  }
  base = ds.models.item(data).set_type('singlestat').rebind(self);

  Object.defineProperty(self, 'title', {get: function() { return title; }});
  Object.defineProperty(self, 'units', {get: function() { return units; }});
  Object.defineProperty(self, 'format', {get: function() { return format; }});
  Object.defineProperty(self, 'index', {get: function() { return index; }});
  Object.defineProperty(self, 'transform', {get: function() { return transform; }});

  /**
   * Data accessors
   */

  self.set_title = function(_) {
    title = _;
    return self;
  }

  self.set_units = function(_) {
    units = _;
    return self;
  }

  self.set_format = function(_) {
    format = _;
    return self;
  }

  self.set_index = function(_) {
    index = _;
    return self;
  }

  self.set_transform = function(_) {
    transform = _;
    return self;
  }

 self.toJSON = function() {
    return base.toJSON({
      title: title,
      format: format,
      transform: transform,
      units: units,
      index: index
    });
  }

  return self;
}
