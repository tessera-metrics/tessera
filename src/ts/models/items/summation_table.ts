import TablePresentation from './table_presentation'
import { register_dashboard_item } from './factory'
import * as core from '../../core'
import Query from '../data/query'
import * as charts from '../../charts/util'

declare var $, ts

const log = core.logger('models.summation_table')

export default class SummationTable extends TablePresentation {

  show_color: boolean = false
  options: any
  palette: string

  constructor(data?: any) {
    super(data)
    if (data) {
      this.show_color = !!data.show_color
      this.options = data.options
      this.palette = data.palette
    }
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      show_color: this.show_color,
      options: this.options,
      palette: this.palette
    })
  }

  data_handler(query: Query) : void {
    log.debug(`data_handler(): ${query.name}/${this.item_id}`)
    let options = this.options || {}
    let palette = charts.get_palette(options.palette || this.palette)
    let body = $('#' + this.item_id + ' tbody')
    body.empty()
    query.data.forEach((series, i) => {
      let color = palette[i % palette.length]
      body.append(ts.templates.models.summation_table_row({series:series, item:this, color: color}))
    })
    if (this.sortable) {
        body.parent().DataTable({
        autoWidth: false,
        paging: false,
        searching: false,
        info: false
        })
    }
  }

  interactive_properties() : core.PropertyList {
    return super.interactive_properties().concat([
      { name: 'show_color', type: 'boolean' },
      'chart.palette'
    ])
  }
}
register_dashboard_item(SummationTable)
