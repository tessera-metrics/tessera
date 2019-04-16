import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import { extend } from '../../util'
import { PropertyList } from '../../core/property'
import Query from '../data/query'

declare var $, d3

export default class SinglestatGrid extends Presentation {
  static meta: DashboardItemMetadata = {
    category: 'data-table',
    icon: 'fa fa-subscript',
    requires_data: true
  }

  units: string
  format: string = ',.3s'
  transform: string = 'mean'
  columns: number = 4
  hide_zero_series: boolean = false  

  constructor(data?: any) {
    super(data)
    if (data) {
      this.units = data.units
      this.format = data.format || this.format
      this.transform = data.transform || this.transform
      this.columns = data.columns || this.columns
      if (typeof(data.hide_zero_series !== 'undefined')) {
        this.hide_zero_series = Boolean(data.hide_zero_series)
      }
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      units: this.units,
      format: this.format,
      transform: this.transform,
      columns: this.columns,
      hide_zero_series: this.hide_zero_series
    })
  }

  data_handler(query: Query) : void {
    if (!query.data)
      return
    let span   = 12 / this.columns
    let format = d3.format(this.format)
    let holder = $(`#${this.item_id} .ds-singlestat-grid-holder`)
    holder.empty()
    query.data.forEach((series, i) => {
      let value = series.summation[this.transform]
      if (!(series.summation.sum === 0 && this.hide_zero_series)) {
        holder.append(ts.templates.models.singlestat_grid_item({
          item: this,
          index: i,
          colspan: span,
          value: format(value),
          label: series.target
        }))
      }
    })
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'units',
      'format',
      'title',
      { name: 'index', type: 'number' },
      {
        name: 'hide_zero_series',
        type: 'boolean'
      },
      {
        name: 'columns',
        edit_options: {
          type: 'select',
          source: [ 1, 2, 3, 4, 6, 12 ]
        }
      },
      'transform',
      'style'
    ])
  }

}
