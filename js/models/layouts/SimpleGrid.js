/**
 * A layout which simply takes all presentations and arranges them in
 * a regular grid.
 */
ds.models.layout.SimpleGrid = function(options) {
  "use strict";

  var columns = 1
    , span = 12
    , section_type = 'fixed'
    , charts_only = false
    , base
    , self = {};

  if (options) {
    columns = options.columns || columns;
    section_type = options.section_type || section_type;
    if (options.charts_only) {
      charts_only = options.charts_only;
    }
  }
  span = 12 / columns;
  base = ds.models.layout.layout({
    layout_name: 'Simple Grid',
    layout_type: 'simple_grid'
  }).rebind(self);

  Object.defineProperty(self, 'columns', { get: function() { return columns; }});
  Object.defineProperty(self, 'section_type', { get: function() { return section_type; }});
  Object.defineProperty(self, 'filter', { get: function() { return filter; }});

  self.layout = function(items) {
    var section     = ds.models.section().set_layout(section_type);
    var current_row = ds.models.row();

    items.forEach( function(item) {
      if (item.item_type == 'dashboard_definition'
         || (charts_only && !item.is_chart))
        return;
      var cell = ds.models.cell()
                 .set_span(span)
                 .add(item);

      if (current_row.add(cell).length == columns) {
        section.add(current_row);
        current_row = ds.models.row();
      }
    } );

    if (current_row.length > 0) {
      section.add(current_row);
    }

    return section;
  }

  self.set_columns = function(_) {
    columns = _;
    span = 12 / columns;
    return self;
  }

  self.set_section_type = function(_) {
    section_type = _;
    return self;
  }

  self.set_charts_only = function(_) {
    charts_only = _;
    return self;
  }

  self.toJSON = function() {
    return base.toJSON({
      columns: columns,
      section_type: section_type,
      charts_only: charts_only
    });
  }

  return self;
}
