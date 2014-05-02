ds.models.tag = function(data) {
  "use strict";

   var id
     , href
     , name
     , description
     , color
     , count
     , item = {};

  if (data) {
    id = data.id;
    href = data.href;
    name = data.name;
    description = data.description;
    color = data.color;
    count = data.count;
  }

  /**
   * Public read-only data properties.
   */

  Object.defineProperty(item, 'id', { value: id });
  Object.defineProperty(item, 'href', { value: href });
  Object.defineProperty(item, 'count', { value: count });

  Object.defineProperty(item, 'name', {get: function() { return name; }});
  Object.defineProperty(item, 'description', {get: function() { return description; }});
  Object.defineProperty(item, 'color', {get: function() { return color; }});

  /**
   * Data mutators
   */

  item.set_name = function(_) {
    name = _;
    return item;
  }

  item.set_description = function(_) {
    description = _;
    return item;
  }

  item.set_color = function(_) {
    color = _;
    return item;
  }

  item.toJSON = function() {
    return {
      id: id,
      href: href,
      name: name,
      description: description,
      color: color,
      count: count
    }
  }

  return item;
}
