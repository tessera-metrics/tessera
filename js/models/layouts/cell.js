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
  base = ds.models.item(data);
  container = ds.models.container(data);

  base.type('cell');
  item.base = base;
  item.container = container;

  d3.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  d3.rebind(item, container, 'items', 'add');

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

  item.span = function(_) {
    if (!arguments.length) return span;
    span = _;
    return item;
  }

  item.offset = function(_) {
    if (!arguments.length) return offset;
    offset = _;
    return item;
  }

  item.align = function(_) {
    if (!arguments.length) return align;
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
