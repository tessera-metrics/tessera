ds.models.dashboard = function(data) {
  "use strict";

  var storage = {}
    , self = {};

  self.visit = function(visitor) {
    visitor(self);
    if (storage.definition) {
      storage.definition.visit(visitor);
    }
    return self;
  }

  self._build_index = function() {
    var index = self.index = {}
    var id = 0;
    self.visit(function(item) {
      if (item.is_dashboard_item) {
        item.set_item_id('d' + id++);
        index[item.item_id] = item;
        item.set_dashboard(self);
      }
    });
    return self;
  };


  limivorous.observable(self, storage)
            .property('id')
            .property('href')
            .property('view_href')
            .property('definition_href')
            .property('creation_date')
            .property('last_modified_date')
            .property('imported_from')
            .property('index')
             .property('title')
            .property('category')
            .property('summary')
            .property('description')
            .property('definition', {
              update: function() {
                self._build_index()
              }
            })
            .property('tags', {
              transform: function(tags) {
                return tags.map(function(t) {
                         return ds.models.tag(t)
                       })
              }
            })

  self.index = {}
  if (data) {
    self.set_id(data.id)
        .set_title(data.title)
        .set_category(data.category)
        .set_summary(data.summary)
        .set_description(data.description)
        .set_creation_date(data.creation_date)
        .set_last_modified_date(data.last_modified_date)
        .set_imported_from(data.imported_from)
        .set_href(data.href)
        .set_view_href(data.view_href)
        .set_definition_href(data.definition_href)
    if (data.definition) {
        self.set_definition(ds.models.dashboard_definition(data.definition))
    }
    if (data.tags && data.tags.length) {
      self.tags = data.tags.map(function(t) {
                    return ds.models.tag(t);
                  });
    }
  }

  /**
   * Operations
   */

  self.get_item = function(id) {
    return self.index[id];
  }

  self.set_items = function(items) {
    storage.definition.set_items(items);
    self._build_index();
    return self;
  }

  self.render = function() {
    return storage.definition.render();
  }

  self.load_all = function() {
    storage.definition.load_all();
    return self;
  }

  self.render_templates = function(context) {
    self.description = ds.render_template(storage.description, context);
    self.title       = ds.render_template(storage.title, context);
    self.summary     = ds.render_template(storage.summary, context);
    if (storage.definition) {
      storage.definition.render_templates(context);
    }
    return self;
  }

  self.flatten = function() {
    return storage.definition ? storage.definition.flatten() : [];
  }

  /**
   * Data mutators.
   */

  self.toJSON = function() {
    return {
     id: storage.id,
     title: storage.title,
     category: storage.category,
     summary: storage.summary,
     description: storage.description,
     creation_date: storage.creation_date,
     last_modified_date: storage.last_modified_date,
     imported_from: storage.imported_from,
     tags: storage.tags.map(function(t) {
             return t.toJSON();
           }),
     definition: storage.definition ? storage.definition.toJSON() : null,
     href: storage.href,
     view_href: storage.view_href,
     definition_href: storage.definition_href
    }
  }
return self
};
