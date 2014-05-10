ds.models.heading = function(data) {
  "use strict";

  var text
    , level = 1
    , description
    , base
    , self = {};

  if (data) {
    text = data.text;
    level = data.level || level;
    description = data.description;
  }
  base = ds.models.item(data).set_item_type('heading').rebind(self);

  Object.defineProperty(self, 'text', {get: function() { return text; }});
  Object.defineProperty(self, 'level', {get: function() { return level; }});
  Object.defineProperty(self, 'description', {get: function() { return description; }});

  self.set_text = function(_) {
    text = _;
    return self;
  }

  self.set_level = function(_) {
    level = _;
    return self;
  }

  self.set_description = function(_) {
    description = _;
    return self;
  }

  self.toJSON = function() {
    var data = base.toJSON()
    if (text)
      data.text = text
    if (level)
      data.level = level
    if (description)
      data.description = description
    return data
  }

  return self;
};
