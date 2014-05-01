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
   * Operations
   */

  item.render_templates = function(context) {
    description = ds.render_template(description, context);
    title = ds.render_template(title, context);
    summary = ds.render_template(summary, context);

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

  item.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return item;
  }

  item.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return item;
  }

  item.category = function(_) {
    if (!arguments.length) return category;
    category = _;
    return item;
  }

  item.summary = function(_) {
    if (!arguments.length) return summary;
    summary = _;
    return item;
  }

  item.description = function(_) {
    if (!arguments.length) return description;
    description = _;
    return item;
  }

  item.creation_date = function(_) {
    if (!arguments.length) return creation_date;
    creation_date = _;
    return item;
  }

  item.last_modified_date = function(_) {
    if (!arguments.length) return last_modified_date;
    last_modified_date = _;
    return item;
  }

  item.imported_from = function(_) {
    if (!arguments.length) return imported_from;
    imported_from = _;
    return item;
  }

  item.tags = function(_) {
    if (!arguments.length) return tags;
    tags = _;
    return item;
  }

  item.definition = function(_) {
    if (!arguments.length) return definition;
    definition = _;
    return item;
  }

  item.href = function(_) {
    if (!arguments.length) return href;
    href = _;
    return item;
  }

  item.view_href = function(_) {
    if (!arguments.length) return view_href;
    view_href = _;
    return item;
  }

  item.definition_href = function(_) {
    if (!arguments.length) return definition_href;
    definition_href = _;
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
