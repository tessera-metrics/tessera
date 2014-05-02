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
  base = ds.models.item(data).set_type('heading').rebind(item);

  Object.defineProperty(item, 'text', {get: function() { return text; }});
  Object.defineProperty(item, 'level', {get: function() { return level; }});
  Object.defineProperty(item, 'description', {get: function() { return description; }});

  item.set_text = function(_) {
    text = _;
    return item;
  }

  item.set_level = function(_) {
    level = _;
    return item;
  }

  item.set_description = function(_) {
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
