import * as core from '../../core'
import * as app from '../../app'
import Singlestat from './singlestat'
import Query from '../data/query'
import { register_dashboard_item } from './factory'

declare var $, d3, ts

const log = core.logger('models.comparison_singlestat')
const FORMAT_PERCENT = d3.format(',.1%')

export default class ComparisonSinglestat extends Singlestat {
  static meta = {
    template: ts.templates.models.singlestat
  }

  private _query_other: string
  percent : boolean = false

  constructor(data?: any) {
    super(data)
    if (data) {
      if (this.query_other instanceof Query) {
        this._query_other = data.query_other.name
      } else {
        this._query_other = data.query_other
      }
      this.percent = !!data.percent
    }
  }

  _update_query() : void {
    if (this._query && this.query_other && this.dashboard) {
      let query = this.dashboard.definition.queries[this._query]
      this.query_override =
        query.join(this.query_other).set_name(this.item_id + '_joined')
      this.query_override.render_templates(app.context().variables)
    }
  }

  get query_other() : Query {
    if (!this.dashboard) {
      return null
    }
    return this.dashboard.definition.queries[this._query_other]
  }

  set query_other(value: Query) {
    this._query_other = value.name
  }

  set_query_other(value: string|Query) : ComparisonSinglestat {
    log.info(`set_query_other: ${value}`)
    if (typeof value === 'string') {
      this._query_other = value
    } else {
      this._query_other = value.name
    }
    return <ComparisonSinglestat> this.updated()
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      query_other: this._query_other,
      percent: this.percent
    })
  }

  render() : string {
    this._update_query()
    return super.render()
  }

  data_handler(query: Query) : void {
    if (query.data.length < 2)
      return
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
      'query_other',
      { name: 'percent', type: 'boolean' }
    ])
  }
}
register_dashboard_item(ComparisonSinglestat)
