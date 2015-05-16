import * as core from '../../core'
import * as app from '../../app'
import Singlestat from './singlestat'
import Query from '../data/query'
import { register_dashboard_item } from './factory'

declare var $, d3, ts

const log = core.logger('models.timeshift_singlestat')
const FORMAT_PERCENT = d3.format(',.1%')

export default class TimeshiftSinglestat extends Singlestat {
  static meta = {
    template: ts.templates.models.singlestat
  }

  private _shift: string = '1d'
  percent : boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      this._shift = data.shift || this._shift
      this.percent = !!data.percent
    }
    this._update_query()
  }

  _update_query() : void {
    if (this._query && this.dashboard) {
      let query = this.dashboard.definition.queries[this._query]
      this.query_override = query
        .join(query.shift(this.shift))
        .set_name(this.item_id + '_shifted')
      this.query_override.render_templates(app.context().variables)
    }
  }

  get shift() : string {
    return this._shift
  }

  set shift(value: string) {
    this._shift = value
  }

  set_shift(value: string) : TimeshiftSinglestat {
    this.shift = value
    return <TimeshiftSinglestat> this.updated()
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      shift: this.shift,
      percent: this.percent
    })
  }

  render() : string {
    this._update_query()
    return super.render()
  }

  data_handler(query: Query) : void {
    let value = query.data[0].summation[this.transform]
    let base  = query.data[1].summation[this.transform]
    let diff  = value - base
    let pct   = (value / base) - 1
    let float_margin = 0.000001
    let diff_elt = $(`#${this.item_id} span.diff`)

    $(`#${this.item_id} span.value`).text(d3.format(this.format)(value))

    if (diff > float_margin)
      diff_elt.addClass('ds-diff-plus')
    else if (diff < float_margin)
      diff_elt.addClass('ds-diff-minus')

    let diff_formatted = this.percent
      ? FORMAT_PERCENT(Math.abs(pct))
      : d3.format(this.format)(Math.abs(diff))
    $(`#${this.item_id} span.diff`).text(diff_formatted)

  }

  interactive_properties(): core.PropertyList {
    return super.interactive_properties().concat([
      'shift',
      { name: 'percent', type: 'boolean' }
    ])
  }
}
register_dashboard_item(TimeshiftSinglestat)
