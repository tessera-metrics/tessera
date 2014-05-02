ds.models.markdown = function(data) {
  "use strict";

  var text
    , raw = false
    , base
    , item = {};

  if (data) {
    text = data.text;
    raw = data.raw !== false;
  }
  base = ds.models.item(data).set_type('markdown').rebind(item);

  Object.defineProperty(item, 'text', {get: function() { return text; }});
  Object.defineProperty(item, 'raw', {get: function() { return raw; }});

  /**
   * Data accessors
   */

  item.set_text = function(_) {
    text = _;
    return item;
  }

  item.set_raw = function(_) {
    raw = _;
    return item;
  }

  item.toJSON = function() {
    return base.toJSON({
      text: text,
      raw: raw
    });
  }

  return item;
};
