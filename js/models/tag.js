ds.models.tag = function(data) {
  "use strict";

   var id
     , href
     , name
     , description
     , color
     , count
     , storage = {}
     , self = {}

  this._init = function(_) {
    if (_) {
      if (_.is_tag) {
        return _
      } else if (typeof _ === 'string') {
        self.set_name(_)
      } else {
        self.set_id(_.id)
        self.set_href(_.href)
        self.set_name(_.name)
        self.set_description(_.description)
      color = _.color
      count = _.count
      }
    }
    return self
  }


  /**
   * Public data properties.
   */

  limivorous.observable(self, storage)
            .property(self, 'id', storage)
            .property(self, 'href', storage)
            .property(self, 'name', storage)
            .property(self, 'description', storage)
            .property(self, 'color', storage)
            .property(self, 'count', storage)

  Object.defineProperty(self, 'is_tag', {value: true});

  self.toJSON = function() {
    return {
      id: storage.id,
      href: storage.href,
      name: storage.name,
      description: storage.description,
      color: storage.color,
      count: storage.count
    }
  }

  return this._init(data)
}
