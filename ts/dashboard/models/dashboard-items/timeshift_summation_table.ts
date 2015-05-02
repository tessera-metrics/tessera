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
    export class TimeshiftSummationTable extends DashboardItem {

      static meta: DashboardItemMetadata = {
        item_type: 'timeshift_summation_table',
        display_name: 'Timeshift Summation Table',
        icon: 'fa fa-table',
        category: 'data-table',
        template: ds.templates.models.timeshift_summation_table,
        requires_data: true,

        actions: [
          ds.action({
            name:    'timeshift_1h',
            display: '1 Hour Ago',
            icon:    'fa fa-clock-o',
            handler: function(action, item) {
              item.shift = '1h'
              ds.manager.update_item_view(item)
            }
          }),
          ds.action({
            name:    'timeshift_1d',
            display: '1 Day Ago',
            icon:    'fa fa-clock-o',
            handler: function(action, item) {
              item.shift = '1d'
              ds.manager.update_item_view(item)
            }
          }),
          ds.action({
            name:    'timeshift_1w',
            display: '1 Week Ago',
            icon:    'fa fa-clock-o',
            handler: function(action, item) {
              item.shift = '1w'
              ds.manager.update_item_view(item)
            }
          }),
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

      striped: boolean = false
      sortable: boolean = false
      format: string = ',.3s'
      title: string
      shift: string = '1d'

      constructor(data?: any) {
        super(data)
        if (data) {
          this.striped = !!data.striped
          this.sortable = !!data.sortable
          this.title = data.title
          this.format = data.format || this.format
          this.shift = data.shift || this.shift
        }
      }

      toJSON() : any {
        let data = super.toJSON()
        data.format = this.format
        data.striped = this.striped
        data.sortable = this.sortable
        data.title = this.title
        data.shift = this.shift
        return data
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
          item: item
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

      interactive_properties(): PropertyListEntry[] {
        return [
          { name: 'striped', type: 'boolean' },
          { name: 'sortable', type: 'boolean' },
          'format',
          'title',
          'query',
          'shift',
          { name: 'css_class', category: 'base' }
        ]
      }


    }
    ts.models.register_dashboard_item(TimeshiftSummationTable)
  }
}

/*
  function update_query() {
  if (this.query && this.query instanceof ts.models.data.Query) {
  this.query_override =
  this.query.join(this.query.shift(this.shift)).set_name(this.item_id + '_shifted')
  this.query_override.render_templates(ds.context().variables)
  }
  }

  this.on('change:query', function(e) {
  update_query()
  }).on('change:dashboard', function(e) {
  update_query()
  }).on('change:shift', function(e) {
  update_query()
  })
*/
