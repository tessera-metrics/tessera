ds.models.dashboard = function(data) {
  "use strict";

  var id
    , creation_date
    , last_modified_date
    , imported_from
    , href
    , view_href
    , definition_href
    , _index = {}
    , storage = {}
    , self = {};


  function _init(_) {
    if (_) {
      id = _.id
      self.set_title(_.title)
          .set_category(_.category)
          .set_summary(_.summary)
          .set_description(_.description)

      if (_.definition) {
        self.set_definition(ds.models.dashboard_definition(_.definition))
      }

      if (_.tags && _.tags.length) {
        self.tags = _.tags.map(function(t) {
                      return ds.models.tag(t);
                    });
      }

      creation_date = _.creation_date;
      last_modified_date = _.last_modified_date;
      imported_from = _.imported_from;
      href = _.href;
      view_href = _.view_href;
      definition_href = _.definition_href;

      return self;
    }
  }

  /**
   * Public read-only data properties.
   */

  Object.defineProperty(self, 'id', { value: id });
  Object.defineProperty(self, 'href', { value: href });
  Object.defineProperty(self, 'view_href', { value: view_href });
  Object.defineProperty(self, 'definition_href', { value: definition_href });
  Object.defineProperty(self, 'creation_date', { value: creation_date });
  Object.defineProperty(self, 'last_modified_date', { value: last_modified_date });
  Object.defineProperty(self, 'index', {get: function() { return _index; }});

  limivorous.observable(self, storage)
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
    _index = {};
    var id = 0;
    self.visit(function(item) {
      if (item.is_dashboard_item) {
        item.set_item_id('d' + id++);
        _index[item.item_id] = item;
        item.set_dashboard(self);
      }
    });
    return self;
  };

  self.get_item = function(id) {
    return _index[id];
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
     id: id,
     title: storage.title,
     category: storage.category,
     summary: storage.summary,
     description: storage.description,
     creation_date: creation_date,
     last_modified_date: last_modified_date,
     imported_from: imported_from,
     tags: storage.tags.map(function(t) {
             return t.toJSON();
           }),
     definition: storage.definition ? storage.definition.toJSON() : null,
     href: href,
     view_href: view_href,
     definition_href: definition_href
    }
  }

  return _init(data);
};
