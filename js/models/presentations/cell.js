ds.models.cell = function(data) {
  "use strict";

  var span = 3
    , offset
    , align
    , container
    , base
    , self = {};

  if (data) {
    span = data.span || span;
    offset = data.offset;
    align = data.align;
  }
  base = ds.models.item(data).set_item_type('cell').rebind(self);
  container = ds.models.container(data).rebind(self);

  Object.defineProperty(self, 'span', { get: function() { return span; }});
  Object.defineProperty(self, 'offset', { get: function() { return offset; }});
  Object.defineProperty(self, 'align', { get: function() { return align; }});

  /**
   * Operations
   */

  self.visit = function(visitor) {
    container.visit(visitor);
    return self;
  }

  /**
   * Data accessors
   */

  self.set_span = function(_) {
    span = _;
    return self;
  }

  self.set_offset = function(_) {
    offset = _;
    return self;
  }

  self.set_align = function(_) {
    align = _;
    return self;
  }

  self.toJSON = function() {
    var data = container.toJSON(base.toJSON())
    if (span)
      data.span = span
    if (offset)
      data.offset = offset
    if (align)
      data.align = align
    return data
  }

  return self;
};
