ds.models.tag = function(data) {
  "use strict";

   var id
     , href
     , name
     , description
     , color
     , count
     , self = {};

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

  Object.defineProperty(self, 'id', { value: id });
  Object.defineProperty(self, 'href', { value: href });
  Object.defineProperty(self, 'count', { value: count });

  Object.defineProperty(self, 'name', {get: function() { return name; }});
  Object.defineProperty(self, 'description', {get: function() { return description; }});
  Object.defineProperty(self, 'color', {get: function() { return color; }});

  /**
   * Data mutators
   */

  self.set_name = function(_) {
    name = _;
    return self;
  }

  self.set_description = function(_) {
    description = _;
    return self;
  }

  self.set_color = function(_) {
    color = _;
    return self;
  }

  self.toJSON = function() {
    return {
      id: id,
      href: href,
      name: name,
      description: description,
      color: color,
      count: count
    }
  }

  return self;
}
