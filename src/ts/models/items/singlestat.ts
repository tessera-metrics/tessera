import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import { register_dashboard_item } from './factory'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import Query from '../data/query'

declare var $
declare var d3

export default class Singlestat extends Presentation {
  static meta: DashboardItemMetadata = {
    category: 'data-table',
    icon: 'fa fa-subscript',
    requires_data: true
  }

  units: string
  format: string = ',.3s'
  index: number
  transform: string = 'mean'

  constructor(data?: any) {
    super(data)
    if (data) {
      this.units = data.units
      this.format = data.format || this.format
      this.index = data.index
      this.transform = data.transform || this.transform
    }
  }

  data_handler(query: Query) : void {
    if (!query.summation)
      return
    var element = $('#' + this.item_id + ' span.value')
    var value = query.summation[this.transform]
    if (this.index) {
      value = query.data[this.index].summation[this.transform]
    }
    element.text(d3.format(this.format)(value))
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      format: this.format,
      transform: this.transform,
      units: this.units,
      index: this.index
    })
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'units',
      'format',
      { name: 'index', type: 'number' },
      'transform'
    ])
  }
}
register_dashboard_item(Singlestat)
