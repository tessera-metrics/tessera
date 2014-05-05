ds.models.dashboard = function(data) {
  "use strict";

  var id
    , title
    , category
    , summary
    , description
    , creation_date
    , last_modified_date
    , imported_from
    , tags = []
    , definition
    , href
    , view_href
    , definition_href
    , _index = {}
    , self = {};

  if (data) {
    id = data.id;
    title = data.title;
    category = data.category;
    summary = data.summary;
    description = data.description;
    creation_date = data.creation_date;
    last_modified_date = data.last_modified_date;
    imported_from = data.imported_from;
    href = data.href;
    view_href = data.view_href;
    definition_href = data.definition_href;

    if (data.definition) {
      definition = ds.models.dashboard_definition(data.definition);
    }
    if (data.tags && data.tags.length) {
      tags = data.tags.map(function(t) {
               return ds.models.tag(t);
             });
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

  Object.defineProperty(self, 'title', {get: function() { return title; }});
  Object.defineProperty(self, 'category', {get: function() { return category; }});
  Object.defineProperty(self, 'summary', {get: function() { return summary; }});
  Object.defineProperty(self, 'description', {get: function() { return description; }});
  Object.defineProperty(self, 'imported_from', {get: function() { return imported_from; }});
  Object.defineProperty(self, 'tags', {get: function() { return tags; }});
  Object.defineProperty(self, 'definition', {get: function() { return definition; }});
  Object.defineProperty(self, 'index', {get: function() { return _index; }});

  /**
   * Operations
   */

  self._build_index = function() {
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

  self.render_templates = function(context) {
    description = ds.render_template(description, context);
    title       = ds.render_template(title, context);
    summary     = ds.render_template(summary, context);
    if (definition) {
      definition.render_templates(context);
    }
    return self;
  }

  self.visit = function(visitor) {
    visitor(self);
    if (definition) {
      definition.visit(visitor);
    }
    return self;
  }

  self.flatten = function() {
    return definition ? definition.flatten() : [];
  }

  /**
   * Data mutators.
   */

  self.set_title = function(_) {
    title = _;
    return self;
  }

  self.set_category = function(_) {
    category = _;
    return self;
  }

  self.set_summary = function(_) {
    summary = _;
    return self;
  }

  self.set_description = function(_) {
    description = _;
    return self;
  }

  self.set_imported_from = function(_) {
    imported_from = _;
    return self;
  }

  self.set_tags = function(_) {
    tags = _.map(function(t) { return ds.models.tag(t); });
    return self;
  }

  self.add_tag = function(_) {
    tags.push(ds.models.tag(_));
    return self;
  }

  self.set_definition = function(_) {
    definition = _;
    return self;
  }

  self.toJSON = function() {
    return {
     id: id,
     title: title,
     category: category,
     summary: summary,
     description: description,
     creation_date: creation_date,
     last_modified_date: last_modified_date,
     imported_from: imported_from,
     tags: tags.map(function(t) {
             return t.toJSON();
           }),
     definition: definition ? definition.toJSON() : null,
     href: href,
     view_href: view_href,
     definition_href: definition_href
    }
  }

  if (definition) {
    self._build_index();
  }

  return self;
};
