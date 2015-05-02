module ts {
  export module models {

    /**
     * This iteration of timeshift_summation_table takes a single query
     * and applies a timeShift() value to it. Another approach is to take
     * two arbitrary queries and compare them (so it's not strictly a
     * time-based comparison).
     *
     * This version is slightly simpler to implement, because we don't
     * need to join on two asynchronously fetched queries.
     */
    export class TimeshiftSummationTable extends TablePresentation {
      static timeshift_action(interval: string, label: string) : ts.Action {
        return new ts.Action({
          name:    `timeshift_${interval}`,
          display: label,
          icon:    'fa fa-clock-o',
          handler: function(action, item) {
            item.shift = interval
            ds.manager.update_item_view(item)
          }
        })
      }

      static meta: DashboardItemMetadata = {
        icon:     'fa fa-table',
        category: 'data-table',
        requires_data: true,
        actions: [
          TimeshiftSummationTable.timeshift_action('1h', '1 Hour Ago'),
          TimeshiftSummationTable.timeshift_action('1d', '1 Day Ago'),
          TimeshiftSummationTable.timeshift_action('1w', '1 Week Ago'),
          ds.action({
            name:    'timeshift_user_input',
            display: 'Pick interval...',
            icon:    'fa fa-clock-o',
            handler: function(action, item) {
              bootbox.prompt({
                backdrop: false,
                title: "Enter a time shift interval",
                callback: function(result) {
                  if (result) {
                    item.shift = result
                    ds.manager.update_item_view(item)
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
          this.query_override.render_templates(ds.context().variables)
        }
      }

      set query(value: ts.models.data.Query) {
        super.set_query(value)
        this._update_query()
      }

      set_query(value: string|ts.models.data.Query) : DashboardItem {
        super.set_query(value)
        this._update_query()
        return this
      }

      set_dashboard(value: any) : DashboardItem {
        super.set_dashboard(value)
        this._update_query()
        return this
      }

      get shift() : string {
        return this._shift
      }

      set shift(value: string) {
        this._shift = value
        this._update_query()
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          shift: this.shift
        })
      }

      data_handler(query: ts.models.data.Query) : void {
        var body = $('#' + this.item_id + ' tbody')
        var now  = query.data[0].summation
        var then = query.data[1].summation
        var diff = new ts.models.data.Summation(now).subtract(then)
        var properties = ['mean', 'median', 'min', 'max', 'sum']
        var float_margin = 0.000001
        properties.forEach(function(prop) {
          var value = diff[prop]

          if (value > float_margin)
            diff[prop + '_class'] = 'ds-diff-plus'
          else if (value < -float_margin)
            diff[prop + '_class'] = 'ds-diff-minus'

          if ((float_margin > value) && (value > -float_margin))
            value = 0.0

          var pct = (now[prop] / then[prop]) - 1
          pct = isNaN(pct) ? 0.0 : pct
          diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct))
          diff[prop] = Math.abs(value)
        })
        body.empty()
        body.append(ds.templates.models.timeshift_summation_table_body({
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
          'shift'
        ])
      }
    }
    ts.models.register_dashboard_item(TimeshiftSummationTable)
  }
}
