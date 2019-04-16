import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import { extend } from '../../util'
import { PropertyList } from '../../core/property'
import Query from '../data/query'

declare var $, d3

export default class Singlestat extends Presentation {
  static meta: DashboardItemMetadata = {
    category: 'data-table',
    icon: 'fa fa-subscript',
    requires_data: true
  }

  units: string
  format: string = ',.3s'
  transform: string = 'mean'
  index: number
  
  constructor(data?: any) {
    super(data)
    if (data) {
      this.units = data.units
      this.format = data.format || this.format
      this.index = data.index
      this.transform = data.transform || this.transform
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      units: this.units,
      format: this.format,
      transform: this.transform,
      index: this.index
    })
  }

  data_handler(query: Query) : void {
    if (!query.summation)
      return
    let element = $(`#${this.item_id} .value`)
    let value = query.summation[this.transform]
    if (this.index) {
      value = query.data[this.index].summation[this.transform]
    }
    element.text(d3.format(this.format)(value))
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'units',
      'format',
      'title',
      { name: 'index', type: 'number' },
      'transform'
    ])
  }
}
