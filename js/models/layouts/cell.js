ds.models.cell = function(data) {
  "use strict";

  var span = 3
    , offset
    , align
    , container
    , base
    , item = {};

  if (data) {
    span = data.span || span;
    offset = data.offset;
    align = data.align;
  }
  base = ds.models.item(data).set_type('cell').rebind(item);
  container = ds.models.container(data).rebind(item);

  Object.defineProperty(item, 'span', { get: function() { return span; }});
  Object.defineProperty(item, 'offset', { get: function() { return offset; }});
  Object.defineProperty(item, 'align', { get: function() { return align; }});

  /**
   * Operations
   */

  item.visit = function(visitor) {
    container.visit(visitor);
    return item;
  }

  /**
   * Data accessors
   */

  item.set_span = function(_) {
    span = _;
    return item;
  }

  item.set_offset = function(_) {
    offset = _;
    return item;
  }

  item.set_align = function(_) {
    align = _;
    return item;
  }

  item.toJSON = function() {
    return container.toJSON(base.toJSON({
      span: span,
      offset: offset,
      align: align
    }));
  }

  return item;
};
