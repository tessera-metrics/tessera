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
    , item = {};

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

  Object.defineProperty(item, 'id', { value: id });
  Object.defineProperty(item, 'href', { value: href });
  Object.defineProperty(item, 'view_href', { value: view_href });
  Object.defineProperty(item, 'definition_href', { value: definition_href });
  Object.defineProperty(item, 'creation_date', { value: creation_date });
  Object.defineProperty(item, 'last_modified_date', { value: last_modified_date });

  Object.defineProperty(item, 'title', {get: function() { return title; }});
  Object.defineProperty(item, 'category', {get: function() { return category; }});
  Object.defineProperty(item, 'summary', {get: function() { return summary; }});
  Object.defineProperty(item, 'description', {get: function() { return description; }});
  Object.defineProperty(item, 'imported_from', {get: function() { return imported_from; }});
  Object.defineProperty(item, 'tags', {get: function() { return tags; }});
  Object.defineProperty(item, 'definition', {get: function() { return definition; }});

  /**
   * Operations
   */

  item.render_templates = function(context) {
    description = ds.render_template(description, context);
    title       = ds.render_template(title, context);
    summary     = ds.render_template(summary, context);
    if (definition) {
      definition.render_templates(context);
    }
    return item;
  }

  item.visit = function(visitor) {
    visitor(item);
    if (definition) {
      definition.visit(visitor);
    }
    return item;
  }

  /**
   * Data accessors.
   */

  item.set_title = function(_) {
    title = _;
    return item;
  }

  item.set_category = function(_) {
    category = _;
    return item;
  }

  item.set_summary = function(_) {
    summary = _;
    return item;
  }

  item.set_description = function(_) {
    description = _;
    return item;
  }

  item.set_imported_from = function(_) {
    imported_from = _;
    return item;
  }

  item.set_tags = function(_) {
    tags = _;
    return item;
  }

  item.add_tag = function(_) {
    tags.push(_);
    return item;
  }

  item.set_definition = function(_) {
    definition = _;
    return item;
  }

  item.toJSON = function() {
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

  return item;
};
