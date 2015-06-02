import Presentation from './presentation'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { DashboardItemMetadata } from './item'

export default class TablePresentation extends Presentation {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-table',
    category: 'data-table',
    requires_data: true
  }

  striped: boolean = false
  sortable: boolean = false
  format: string = ',.3s'

  constructor(data?: any) {
    super(data)
    if (data) {
      this.striped = !!data.striped
      this.sortable = !!data.sortable
      this.format = data.format || this.format
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      striped: this.striped,
      sortable: this.sortable,
      format: this.format,
    })
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      { name: 'striped', type: 'boolean' },
      { name: 'sortable', type: 'boolean' },
      'format'
    ])
  }
}
