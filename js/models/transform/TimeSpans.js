/**
 * Transform a view of a single graph into viewing that graph over
 * multiple time spans. The item being transformed should be a single
 * presentation, not a composite (i.e. not a cell, row, section, or
 * dashboard).
 *
 * The time periods can be customized by passing an array of objects
 * with from/until/title properties
 *
 * Input => A single presentation
 *
 * Output => A section with a list of copies of the presentation with
 *           immediate query objects that override the time period
 */
ds.models.transform.TimeSpans = function(options) {
  'use strict'

  var self =
    limivorous.observable()
              .property('spans', {
                init: [
                  { from: '-1h', title: 'Past Hour' },
                  { from: '-4h', title: 'Past 4 Hours' },
                  { from: '-1d', title: 'Past Day' },
                  { from: '-1w', title: 'Past Week' }
                ]
              })
              .property('columns', { init: 1})
              .extend(ds.models.transform.transform, {
                transform_name: 'View across time spans',
                transform_type: 'time_spans'
              })
              .build()

  if (options) {
    self.spans = options.spans || self.spans
    self.columns = options.columns || self.columns
  }

  self.transform = function(item) {
    var query   = item.query
    var section = ds.models.section()

    for (var i in self.spans) {
      var span = self.spans[i]
      var modified_query = ds.models.data.Query(query.toJSON())
                             .set_name(query.name + '/' + span.from + '/' + span.until)
                             .set_options(ds.extend(query.options || {},
                                                  {
                                                    from: span.from,
                                                    until: span.until
                                                  }))
      var modified_item = ds.models.factory(item.toJSON())
                            .set_query(modified_query)
                            .set_title(item.title
                                      ? span.title + ' - ' + item.title
                                      : span.title)
      section.add(ds.models.cell()
                  .set_span(12)
                  .add(modified_item))
    }

    return section
  }

  self.toJSON = function() {
    return ds.models.transform.transform.json(self, {
      spans: self.spans,
      columns: self.columns
    })
  }

  return self
}
