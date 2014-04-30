ds.models.tag = function(data) {
  "use strict";

   var id
     , name
     , description
     , color
     , count
     , item = {};

  if (data) {
    id = data.id;
    name = data.name;
    description = data.description;
    color = data.color;
    count = data.count;
  }

  item.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return item;
  }

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

  item.count = function(_) {
    if (!arguments.length) return count;
    count = _;
    return item;
  }

  item.to_json = function() {
    return {
      id: id,
      name: name,
      description: description,
      color: color,
      count: count
    }
  }

  return item;
}
