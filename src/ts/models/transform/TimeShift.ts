import { transforms } from './transform'
import { make } from '../items/factory'

/**
 * Transform a view of a single graph into viewing multiple of that
 * graph at the same temporal resolution but shifted by one or more
 * time periods.
 */
transforms.register({
  name: 'TimeShift',
  display_name: 'Time Shift',
  transform_type: 'presentation',
  icon: 'fa fa-clock-o',

  transform: function(item: any) : any {
    let query = item.query
    let shifts = [
      { shift:  '-1h', title: 'One Hour Ago' },
      { shift: '-12h', title: '12 Hours Ago' },
      { shift:  '-1d', title: 'One Day Ago'  },
      { shift:  '-2d', title: 'Two Days Ago' },
      { shift:  '-1w', title: 'One Week Ago' }
    ]
    let make_row = function(query, item, style?) {
      return make('row')
        .set_style(style)
        .add(make('cell')
             .set_span(10)
             .add(item))
        .add(make('cell')
             .set_span(1)
             .set_align('right')
             .add(make('singlestat')
                  .set_query(query)
                  .set_transform('sum')
                  .set_format(',.2s')
                  .set_title('Total')))
        .add(make('cell')
             .set_span(1)
             .set_align('left')
             .add(make('singlestat')
                  .set_query(query)
                  .set_transform('mean')
                  .set_format(',.2s')
                  .set_title('Average')))
    }

    let section = make('section')
      .add(make({ item_type: 'heading',
                  level: 2, text: item.title
                  ? 'Time shift - ' + item.title
                  : 'Time shift' }))
      .add(make('separator'))
      .add(make_row(item.query, item, 'well'))
      .add(make('separator'))

    for (let shift of shifts) {
      let modified_query = query.shift(shift.shift)
      let modified_item  = make(item.toJSON())
        .set_item_id(undefined)
        .set_query_override(modified_query)
        .set_title(shift.title)
      section.add(make_row(modified_query, modified_item))
    }

    return section
  }
})
