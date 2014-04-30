ds.models.markdown = function(data) {
  "use strict";

  var text
    , raw = False
    , base
    , item = {};

  if (data) {
    text = data.text;
    raw = data.raw !== false;
  }
  base = ds.models.item(data);

  base.type('markdown');
  item.base = base;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  item.text = function(_) {
    if (!arguments.length) return text;
    text = _;
    return item;
  }

  item.raw = function(_) {
    if (!arguments.length) return raw;
    raw = _;
    return item;
  }

  item.to_json = function() {
    return container.to_json(base.to_json({
      text: text,
      raw: raw
    }));
  }

  return item;
};
