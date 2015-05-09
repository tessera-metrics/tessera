import { transforms } from './transform'
import { make } from '../items/factory'

/**
 * Focus on a single presentation.
 */
transforms.register({
  name: 'Isolate',
  display_name: 'Isolate',
  transform_type: 'presentation',

  transform: function(item: any) : any {
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
