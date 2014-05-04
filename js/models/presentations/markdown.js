ds.models.markdown = function(data) {
  "use strict";

  var text
    , raw = false
    , base
    , self = {};

  if (data) {
    text = data.text;
    if (data.raw !== undefined) {
      raw = data.raw;
    }
  }
  base = ds.models.item(data).set_type('markdown').rebind(self);

  Object.defineProperty(self, 'text', {get: function() { return text; }});
  Object.defineProperty(self, 'raw', {get: function() { return raw; }});

  /**
   * Data accessors
   */

  self.set_text = function(_) {
    text = _;
    return self;
  }

  self.set_raw = function(_) {
    raw = _;
    return self;
  }

  self.toJSON = function() {
    return base.toJSON({
      text: text,
      raw: raw
    });
  }

  return self;
};
