ds.models.dashboard = function(data) {
  "use strict"

  var self = limivorous.observable()
                       .property('id')
                       .property('href')
                       .property('view_href')
                       .property('definition_href')
                       .property('creation_date')
                       .property('last_modified_date')
                       .property('imported_from')
                       .property('index')
                       .property('title')
                       .property('expanded_title')
                       .property('category')
                       .property('summary')
                       .property('expanded_summary')
                       .property('description')
                       .property('expanded_description')
                       .property('definition', {
                         update: function() {
                           self.update_index()
                         }
                       })
                       .property('tags', {
                         init: [],
                         transform: function(tags) {
                           return tags.map(function(t) {
                                    return ds.models.tag(t)
                                  })
                         }
                       })
                       .build()
    , next_id = 0

  self.index = {}

  self.visit = function(visitor) {
    visitor(self)
    if (self.definition) {
      self.definition.visit(visitor)
    }
    return self
  }

  self.next_id = function() {
    while (true) {
      var id = 'd' + next_id++
      if (typeof(self.index[id]) === 'undefined') {
        return id
      }
    }
  }

  self.reindex = function() {
    next_id = 0
    self.visit(function(item) {
      item.item_id = self.next_id()
    })
  }

  self.update_index = function() {
    var index = {}
    self.visit(function(item) {
      if (item.is_dashboard_item) {
        if ( !item.item_id ) {
          item.item_id = self.next_id()
        }
        if (index[item.item_id]) {
          console.log('ERROR: item_id + ' + item.item_id + ' is already indexed.')
        }
        index[item.item_id] = item
        item.set_dashboard(self)
      }
    })
    self.index = index
    return self
  }

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
        self.set_definition(ds.models.factory(data.definition))
    }
    if (data.tags && data.tags.length) {
      self.tags = data.tags.map(function(t) {
                    return ds.models.tag(t)
                  })
    }
    self.visit(function(item) {
      next_id++
    })
    self.next_id()
  }

  /**
   * Operations
   */

  self.get_item = function(id) {
    return self.index[id]
  }

  self.find_parent = function(item_or_id) {
    var parent = undefined
    self.visit(function(item) {
      if (item.is_container && item.contains(item_or_id)) {
        parent = item
      }
    })
    return parent
  }

  self.set_items = function(items) {
    self.definition.items = items
    self.update_index()
    return self
  }

  self.render = function() {
    return self.definition.render()
  }

  self.load_all = function(options, fire_only) {
    self.definition.load_all(options, fire_only)
    return self
  }

  self.cleanup = function() {
    self.definition.cleanup()
  }

  self.render_templates = function(context) {
    context.id = self.id
    self.expanded_description = ds.safe_render_template(self.description, context)
    self.expanded_title       = ds.safe_render_template(self.title, context)
    self.expanded_summary     = ds.safe_render_template(self.summary, context)
    if (self.definition) {
      self.definition.render_templates(context)
    }
    return self
  }

  self.flatten = function() {
    return self.definition ? self.definition.flatten() : []
  }

  /**
   * Data mutators.
   */

  self.toJSON = function() {
    return {
     id: self.id,
     title: self.title,
     category: self.category,
     summary: self.summary,
     description: self.description,
     creation_date: self.creation_date,
     last_modified_date: self.last_modified_date,
     imported_from: self.imported_from,
     tags: self.tags.map(function(t) {
             return t.toJSON()
           }),
     definition: self.definition ? self.definition.toJSON() : null,
     href: self.href,
     view_href: self.view_href,
     definition_href: self.definition_href
    }
  }
return self
}
