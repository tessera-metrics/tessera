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
    var make = ds.models.make
    var section = make('section')
                  .add(make('row')
                       .add(make('cell')
                            .set_span(12)
                            .set_style(self.style)
                            .add(item.set_height(6)
                                 .set_interactive(true))))
                  .add(make('row')
                       .add(make('cell')
                            .set_span(12)
                            .add(make({item_type: 'summation_table', query: item.query}))))
    return section
  }

  self.toJSON = function() {
    return ds.models.transform.transform.json(self, {})
  }

  return self
}
