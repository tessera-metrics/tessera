ds.models.heading = function(data) {
  "use strict";

  var text
    , level = 1
    , description
    , base
    , item = {};

  if (data) {
    text = data.text;
    level = data.level || level;
    description = data.description;
  }
  base = ds.models.item(data);

  base.type('heading');
  item.base = base;

  ds.rebind(item, base, 'type', 'css_class', 'element_id', 'height', 'style');

  item.text = function(_) {
    if (!arguments.length) return text;
    text = _;
    return item;
  }

  item.level = function(_) {
    if (!arguments.length) return level;
    level = _;
    return item;
  }

  item.description = function(_) {
    if (!arguments.length) return description;
    description = _;
    return item;
  }

  item.toJSON = function() {
    return base.toJSON({
      text: text,
      level: level,
      description: description
    });
  }

  return item;
};
