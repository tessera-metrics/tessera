/**
 * Focus on a single presentation.
 */
ds.transforms.register({
  name: 'Isolate',
  display_name: 'Isolate',
  transform_type: 'presentation',

  transform: function(item) {
    var make = ds.models.make
    var options = item.options || {}
    return make('section')
             .add(make('row')
                    .add(make('cell')
                           .set_span(12)
                           .set_style('well')
                           .add(item.set_height(6)
                                    .set_interactive(true))))
             .add(make('row')
                    .add(make('cell')
                           .set_span(12)
                           .add(make({item_type: 'summation_table',
                                      options: {
                                        palette: options.palette
                                      },
                                      show_color: true,
                                      sortable: true,
                                      format: ',.3f',
                                      query: item.query}))))
  }
})
