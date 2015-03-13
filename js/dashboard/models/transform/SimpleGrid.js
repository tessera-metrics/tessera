/**
 * A transform which simply takes all presentations and arranges them in
 * a regular grid.
 */
ds.models.transform.SimpleGrid = function(data) {
  "use strict"

  var self = limivorous.observable()
                       .property('columns', { init: 1,
                                              update: function(target) {
                                                target.span = 12 / target.columns
                                              }
                                            })
                       .property('span', {init: 12})
                       .property('section_type', {init: 'fixed'})
                       .property('charts_only', {init: false})
                       .build()

  if (data) {
    self.display_name   = 'Simple Grid'
    self.name           = 'SimpleGrid'
    self.transform_type = 'dashboard'
    self.columns = data.columns || self.columns
    self.section_type = data.section_type || self.section_type
    if (data.charts_only) {
      self.charts_only = data.charts_only
    }
  }
  self.span = 12 / self.columns

  self.transform = function(item) {
    var items       = item.flatten()
    var section     = ds.models.make('section').set_layout(self.section_type)
    var current_row = ds.models.make('row')

    items.forEach( function(item) {
      if (   item.item_type === 'dashboard_definition'
          || item.item_type === 'cell'
          || item.item_type === 'row'
          || item.item_type === 'section'
          || (self.charts_only && !item.is_chart)) {
        return
      }
      var cell = ds.models.make('cell')
                   .set_span(self.span)
                   .add(item)

      if (current_row.add(cell).length == self.columns) {
        section.add(current_row)
        current_row = ds.models.make('row')
      }
    } )

    if (current_row.length > 0) {
      section.add(current_row)
    }

    return section
  }


  self.toJSON = function() {
    return {
      columns: self.columns,
      span: self.span,
      section_type: self.section_type,
      charts_only: self.charts_only,
      name: self.name
    }
  }

  return self
}
