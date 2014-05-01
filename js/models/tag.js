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

  /**
   * Data accesors
   */

  item.name = function(_) {
    if (!arguments.length) return name;
    name = _;
    return item;
  }

  item.description = function(_) {
    if (!arguments.length) return description;
    description = _;
    return item;
  }

  item.color = function(_) {
    if (!arguments.length) return color;
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
