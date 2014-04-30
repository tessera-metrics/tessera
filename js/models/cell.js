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

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');
  ds.rebind(item, container, 'items', 'add');

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

  item.to_json = function() {
    return container.to_json(base.to_json({
      span: span,
      offset: offset,
      align: align
    }));
  }

  return item;
};
