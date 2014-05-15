/**
 * Focus on a single presentation.
 */
ds.models.transform.Isolate = function(options) {
  'use strict'

  var self =
    limivorous.observable()
              .extend(ds.models.transform.transform, {
                display_name: 'Isolate',
                transform_name: 'Isolate',
                transform_type: 'presentation'
              })
              .property('style', {init: 'well'})
              .build()

  self.transform = function(item) {
    var section = ds.models.section()
                    .add(ds.models.row()
                         .add(ds.models.cell()
                                .set_span(12)
                                .set_style(self.style)
                                .add(item.set_height(6)
                                         .set_interactive(true))))
                    .add(ds.models.row()
                         .add(ds.models.cell()
                                .set_span(12)
                                .add(ds.models.summation_table({query: item.query}))))
    /* HACK - everything about the interactive flag is a hack right now */
    if (item.query.options) {
      item.query.options.fire_only = false
    }
    return section
  }

  self.toJSON = function() {
    return ds.models.transform.transform.json(self, {})
  }

  return self
}
