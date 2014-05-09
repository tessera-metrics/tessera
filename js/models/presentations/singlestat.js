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
  Object.defineProperty(self, 'requires_data', {value: true});

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
   var data = base.toJSON()
   if (title)
     data.title = title
   if (format)
     data.format = format
   if (transform)
     data.transform = transform
   if (units)
     data.units = units
   if (index)
     data.index = index
   return data
 }

  return self;
}
