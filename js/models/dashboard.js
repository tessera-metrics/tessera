ds.models.dashboard = function(data) {
  "use strict";

  var storage = {}
    , self = {};


  this._init = function(_) {
    self.index = {}
    if (_) {
      self.set_id(_.id)
          .set_title(_.title)
          .set_category(_.category)
          .set_summary(_.summary)
          .set_description(_.description)
          .set_creation_date(_.creation_date)
          .set_last_modified_date(_.last_modified_date)
          .set_imported_from(_.imported_from)
          .set_href(_.href)
          .set_view_href(_.view_href)
          .set_definition_href(_.definition_href)
      if (_.definition) {
        self.set_definition(ds.models.dashboard_definition(_.definition))
      }
      if (_.tags && _.tags.length) {
        self.tags = _.tags.map(function(t) {
                      return ds.models.tag(t);
                    });
      }
    }
    return self;
  }

  /**
   * Public read-only data properties.
   */

  limivorous.observable(self, storage)
            .property(self, 'id', storage)
            .property(self, 'href', storage)
            .property(self, 'view_href', storage)
            .property(self, 'definition_href', storage)
            .property(self, 'creation_date', storage)
            .property(self, 'last_modified_date', storage)
            .property(self, 'imported_from', storage)
            .property(self, 'index', storage)

            .property(self, 'title', storage)
            .property(self, 'category', storage)
            .property(self, 'summary', storage)
            .property(self, 'description', storage)
            .property(self, 'definition', storage, {
              update: function() {
                self._build_index()
              }
            })
            .property(self, 'tags', storage, {
              transform: function(tags) {
                return tags.map(function(t) {
                         return ds.models.tag(t)
                       })
              }
            })


  /**
   * Operations
   */

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
    storage.description = ds.render_template(storage.description, context);
    storage.title       = ds.render_template(storage.title, context);
    storage.summary     = ds.render_template(storage.summary, context);
    if (storage.definition) {
      storage.definition.render_templates(context);
    }
    return self;
  }

  self.visit = function(visitor) {
    visitor(self);
    if (storage.definition) {
      storage.definition.visit(visitor);
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

  return this._init(data);
};
