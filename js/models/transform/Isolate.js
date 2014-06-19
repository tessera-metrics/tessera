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
    var section = ds.models.make('section')
                    .add(ds.models.make('row')
                         .add(ds.models.make('cell')
                                .set_span(12)
                                .set_style(self.style)
                                .add(item.set_height(6)
                                         .set_interactive(true))))
                    .add(ds.models.make('row')
                         .add(ds.models.make('cell')
                                .set_span(12)
                                .add(ds.models.make({item_type: 'summation_table', query: item.query}))))
    return section
  }

  self.toJSON = function() {
    return ds.models.transform.transform.json(self, {})
  }

  return self
}
