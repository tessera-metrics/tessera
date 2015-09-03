import TablePresentation from './table_presentation'
import * as core from '../../core'
import Query from '../data/query'
import * as charts from '../../charts'

declare var $, ts

const log = core.logger('models.summation_table')

export default class SummationTable extends TablePresentation {

  options: any
  palette: string

  show_color: boolean = false
  show_min : boolean = true
  show_max : boolean = true
  show_mean : boolean = true
  show_median : boolean = true
  show_sum : boolean = true
  show_current : boolean = true
  show_sparkline : boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      this.show_color = !!data.show_color
      this.options = data.options
      this.palette = data.palette
      if (typeof data.show_min != 'undefined')
        this.show_min = !!data.show_min
      if (typeof data.show_max != 'undefined')
        this.show_max = !!data.show_max
      if (typeof data.show_mean != 'undefined')
        this.show_mean = !!data.show_mean
      if (typeof data.show_median != 'undefined')
        this.show_median = !!data.show_median
      if (typeof data.show_sum != 'undefined')
        this.show_sum = !!data.show_sum
      if (typeof data.show_current != 'undefined')
        this.show_current = !!data.show_current
      if (typeof data.show_sparkline != 'undefined')
        this.show_sparkline = !!data.show_sparkline
    }
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      show_color: this.show_color,
      show_min: this.show_min,
      show_max: this.show_max,
      show_mean: this.show_mean,
      show_median: this.show_median,
      show_sum: this.show_sum,
      show_current: this.show_current,
      show_sparkline: this.show_sparkline,
      options: this.options,
      palette: this.palette
    })
  }

  data_handler(query: Query) : void {
    log.debug(`data_handler(): ${query.name}/${this.item_id}`)
    let options = this.options || {}
    let palette = charts.get_palette(options.palette || this.palette)
    let body = $('#' + this.item_id + ' table.ds-summation-table tbody')
    let flot = <charts.FlotChartRenderer>charts.renderers.get('flot')
    body.empty()
    query.data.forEach((series, i) => {
      let color = palette[i % palette.length]
      body.append(ts.templates.models.summation_table_row({series:series, item:this, color: color, index: i}))
      if (this.show_sparkline) {
        let plot_div = $(`#${this.item_id}-sparkline-${i}`)
        let options = {
          colors: this.show_color
            ? [color]
            : palette
        }
        flot.sparkline(plot_div, this, query, i, options)
      }
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
      { name: 'show_color', type: 'boolean', category: 'summation' },
      { name: 'show_min', type: 'boolean', category: 'summation' },
      { name: 'show_max', type: 'boolean', category: 'summation' },
      { name: 'show_mean', type: 'boolean', category: 'summation' },
      { name: 'show_median', type: 'boolean', category: 'summation' },
      { name: 'show_sum', type: 'boolean', category: 'summation' },
      { name: 'show_current', type: 'boolean', category: 'summation' },
      { name: 'show_sparkline', type: 'boolean', category: 'summation' },
      'chart.palette',
      'title'
    ])
  }
}
