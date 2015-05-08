import TablePresentation from './table_presentation'
import { DashboardItemMetadata } from './item'
import Query from '../data/Query'
import { extend } from '../../core/util'
import { PropertyList } from '../../core/property'
import { register_dashboard_item } from './factory'

declare var $, tessera

export class PercentageTable extends TablePresentation {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-table',
    category: 'data-table',
    requires_data: true
  }

  include_sums: boolean = false
  invert_axes: boolean = false
  transform: string = 'sum'

  constructor(data?: any) {
    super(data)
    if (data) {
      this.include_sums = data.include_sums
      this.invert_axes  = data.invert_axes
      this.transform    = data.transform || this.transform
    }
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      invert_axes:  this.invert_axes,
      transform:    this.transform,
      include_sums: this.include_sums
    })
  }

  data_handler(query: Query) {
    query.summation.percent_value = query.summation[this.transform]

    query.data.forEach((series) => {
      series.summation.percent = 1 / (query.summation[this.transform] / series.summation[this.transform])
      series.summation.percent_value = series.summation[this.transform]
    })

    var holder = $('#' + this.item_id + ' .ds-percentage-table-holder')
    holder.empty()
    holder.append(tessera.templates.models.percentage_table_data({item:this, query:query}))
    if (this.sortable) {
      var table = $('#' + this.item_id + ' .ds-percentage-table-holder table')
      table.DataTable({
        order: [[ 2, "desc" ]],
        paging: false,
        searching: true,
        oLanguage: { sSearch: "" },
        info: true
      })
    }
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      { name: 'invert_axes', type: 'boolean' },
      {
        name: 'include_sums',
        type: 'boolean'
      },
      'transform'
    ])
  }
}
register_dashboard_item(PercentageTable)
