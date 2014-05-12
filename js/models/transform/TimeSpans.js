/**
 * Transform a view of a single graph into viewing that graph over
 * multiple time spans. The item being transformed should be a single
 * presentation, not a composite (i.e. not a cell, row, section, or
 * dashboard).
 */
ds.models.transform.TimeSpans = function(options) {
  'use strict'

  var self = limivorous.observable()
             .property('spans', {
               init: [
               { from: '-1h' },
               { from: '-4h' },
               { from: '-1d' },
               { from: '-1w' }
               ]
             })
             .extend(ds.models.transform.transform, {
               transform_name: 'View across time spans',
               transform_type: 'time_spans'
             })
             .build()

  self.transform = function(item) {
    var query   = item.query
    var section = ds.models.section()

    for (var i in self.spans) {
      var span = self.spans[i]
      var modified_query = ds.models.data.Query(query.toJSON())
                           .set_options({
                             from: span.from,
                             until: span.until
                           })
      var modified_item = ds.models.factory(item.toJSON())
                          .set_query(modified_query)
      section.add(ds.models.cell()
                  .set_span(12)
                  .add(modified_item))
    }

    return section
  }

  return self
}
