import * as core from '../../core'
import TablePresentation from './table_presentation'
import { DashboardItemMetadata } from './item'
import Query from '../data/query'
import Summation from '../data/summation'
import * as app from '../../app/app'

declare var $, bootbox, d3, ts

/**
 * This iteration of timeshift_summation_table takes a single query
 * and applies a timeShift() value to it. Another approach is to take
 * two arbitrary queries and compare them (so it's not strictly a
 * time-based comparison).
 *
 * This version is slightly simpler to implement, because we don't
 * need to join on two asynchronously fetched queries.
 */
export default class TimeshiftSummationTable extends TablePresentation {
  static timeshift_action(interval: string, label: string) : core.Action {
    return new core.Action({
      name:    `timeshift_${interval}`,
      display: label,
      icon:    'fa fa-clock-o',
      handler: function(action, item) {
        item.set_shift(interval)
      }
    })
  }

  static meta: DashboardItemMetadata = {
    actions: [
      TimeshiftSummationTable.timeshift_action('1h', '1 Hour Ago'),
      TimeshiftSummationTable.timeshift_action('1d', '1 Day Ago'),
      TimeshiftSummationTable.timeshift_action('1w', '1 Week Ago'),
      new core.Action({
        name:    'timeshift_user_input',
        display: 'Pick interval...',
        icon:    'fa fa-clock-o',
        handler: function(action, item) {
          bootbox.prompt({
            backdrop: false,
            title: "Enter a time shift interval",
            callback: function(result) {
              if (result) {
                item.set_shift(result)
              }
            }
          })
        }
      })
    ]
  }

  private _shift: string = '1d'

  constructor(data?: any) {
    super(data)
    if (data) {
      this._shift = data.shift || this._shift
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

  set_shift(value: string) : TimeshiftSummationTable {
    this.shift = value
    return <TimeshiftSummationTable> this.updated()
  }

  toJSON() : any {
    return core.extend(super.toJSON(), {
      shift: this.shift
    })
  }

  render() : string {
    this._update_query()
    return super.render()
  }

  data_handler(query: Query) : void {
    let body = $('#' + this.item_id + ' tbody')
    let now  = query.data[0].summation
    let then = query.data[1].summation
    let diff = new Summation(now).subtract(then)
    let properties = ['mean', 'median', 'min', 'max', 'sum']
    let float_margin = 0.000001
    properties.forEach(function(prop) {
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
    body.append(ts.templates.models.timeshift_summation_table_body({
      now:  now,
      then: then,
      diff: diff,
      item: this
    }))
    if (this.sortable && !$.fn.dataTable.isDataTable(body.parent())) {
      body.parent().DataTable({
        autoWidth: false,
        paging: false,
        searching: false,
        info: false
      })
    }
  }

  interactive_properties(): core.PropertyList {
    return super.interactive_properties().concat([
      'shift'
    ])
  }
}
