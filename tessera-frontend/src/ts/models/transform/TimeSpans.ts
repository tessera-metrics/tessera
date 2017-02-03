import { transforms } from './transform'
import { make } from '../items/factory'
import { extend } from '../../util'
import Query from '../data/query'

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
transforms.register({
  name:           'TimeSpans',
  display_name:   'View across time spans',
  transform_type: 'presentation',
  icon: '          fa fa-clock-o',

  transform: function(item: any) : any {
    let spans : { from: string, until?: string, title: string }[] = [
      { from: '-1h', title: 'Past Hour' },
      { from: '-4h', title: 'Past 4 Hours' },
      { from: '-1d', title: 'Past Day' },
      { from: '-1w', title: 'Past Week' }
    ]
    let columns = 1
    let query   = item.query
    let colspan = 12 / columns
    let section = make('section')
      .add(make('heading', {
        level: 2, text: item.title
          ? 'Time Spans - ' + item.title
          : 'Time Spans' }))
      .add(make('separator'))

    section.add(make('cell')
                .set_span(colspan)
                .set_style('well')
                .add(item.set_title('Original')))
      .add(make('separator'))

    for (let span of spans) {
      let modified_query = new Query(query.toJSON())
        .set_name(query.name + '/' + span.from + '/' + span.until)
        .set_options(extend({}, query.options,
                            {
                              from: span.from,
                              until: span.until
                            }))
      let modified_item = make(item.toJSON())
        .set_item_id(undefined)
        .set_query_override(modified_query)
        .set_title(span.title)

      section.add(make('cell')
                  .set_span(colspan)
                  .add(modified_item))
    }

    return section
  }
})
