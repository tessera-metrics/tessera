import TablePresentation from './table_presentation'
import { extend } from '../../core/util'
import Query from '../data/query'
import Summation from '../data/summation'
import { PropertyList, property } from '../../core/property'
import { register_dashboard_item } from './factory'
import * as app from '../../app/app'

declare var $, d3, ts

/**
 * A summation table that compares two arbitrary queries.
 */
export default class ComparisonSummationTable extends TablePresentation {

  private _query_other: string

  constructor(data?: any) {
    super(data)
    if (data) {
      if (this.query_other instanceof Query) {
        this._query_other = data.query_other.name
      } else {
        this._query_other = data.query_other
      }
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

  set_query_other(value: string|Query) : ComparisonSummationTable {
    if (typeof value === 'string') {
      this._query_other = value
    } else {
      this._query_other = value.name
    }
    return <ComparisonSummationTable> this.updated()
  }

  toJSON() : any {
    return extend(super.toJSON(), {
      query_other: this._query_other
    })
  }

  render() : string {
    this._update_query()
    return super.render()
  }

  data_handler(query: Query) : void {
    if (query.data.length < 2)
      return
    let body = $('#' + this.item_id + ' tbody')
    let now  = query.data[0].summation
    let then = query.data[1].summation
    let diff = new Summation(now).subtract(then)
    let properties = ['mean', 'min', 'max', 'sum']
    let float_margin = 0.000001
    properties.forEach((prop) => {
      let value = diff[prop]

      if (value > float_margin)
        diff[prop + '_class'] = 'ds-diff-plus'
      else if (value < -float_margin)
        diff[prop + '_class'] = 'ds-diff-minus'

      if ((float_margin > value) && (value > -float_margin))
        value = 0.0

      let pct = (now[prop] / then[prop]) - 1
      pct = isNaN(pct) ? 0.0 : pct
      diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct))
      diff[prop] = Math.abs(value)
    })
    body.empty()
    body.append(ts.templates.models.comparison_summation_table_body({
      now:  now,
      then: then,
      diff: diff,
      item: this
    }))
    if (this.sortable) {
      body.parent().DataTable({
        autoWidth: false,
        paging: false,
        searching: false,
        info: false
      })
    }
  }

  interactive_properties(): PropertyList {
    return super.interactive_properties().concat([
      'query_other'
    ])
  }
}
register_dashboard_item(ComparisonSummationTable)
