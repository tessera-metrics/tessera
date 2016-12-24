import { transforms } from './transform'
import { make } from '../items/factory'
import Chart from '../items/chart'
import Query from '../data/query'

const DEFAULT_COLUMN_COUNT = 3

transforms.register({
  name: 'Split',
  display_name: 'Split',
  transform_type: 'presentation',

  transform: function(item: any) : any {
    let query = item['query'] || item['query_override']
    if (!query || !query.data) {
      return item
    }

    let colcount = DEFAULT_COLUMN_COUNT
    let span     = 12 / colcount
    let section  = make('section')
    let row      = make('row')

    let n = 0
    for (let series of query.data) {
      let new_query = new Query({})
      new_query.name = item.item_id + '-split-' + n++
      new_query.targets = []
      new_query.data = [series]
      new_query.summation = series.summation
      row.add(make('cell')
              .set_span(span)
              .add(make('standard_time_series')
                   .set_query_override(new_query)))
      if (row.length == colcount) {
        section.add(row)
        row = make('row')
      }
    }
    if (row.length > 0) {
      section.add(row)
    }

    return section
  }
})
