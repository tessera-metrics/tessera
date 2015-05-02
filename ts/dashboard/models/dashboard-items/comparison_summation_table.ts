module ts {
  export module models {

    /**
     * A summation table that compares two arbitrary queries.
     *
     * TODO - make a table item base class
     */
    export class ComparisonSummationTable extends DashboardItem {
      static meta: DashboardItemMetadata = {
        item_type: 'comparison_summation_table',
        display_name: 'Comparison Summation Table',
        icon: 'fa fa-table',
        category: 'data-table',
        requires_data: true,
        template: ds.templates.models.comparison_summation_table
      }

      striped: boolean = false
      sortable: boolean = false
      format: string = ',.3s'
      title: string
      private _query_other: string|ts.models.data.Query

      get query_other() : string|ts.models.data.Query {
        if (typeof this._query_other === 'string' && this.dashboard) {
          return this.dashboard.definition.queries[<string>this._query_other]
        } else {
          return this._query_other
        }
      }

      constructor(data?: any) {
        super(data)
        if (data) {
          this.striped = Boolean(data.striped)
          this.sortable = Boolean(data.sortable)
          this.title = data.title
          this.format = data.format || this.format
          this.query_other = data.query_other
        }
      }

      /*
        function update_query() {
        if ((this.query && this.query instanceof ts.models.data.Query)
        && (this.query_other && this.query_other instanceof ts.models.data.Query)) {
        this.query_override =
        this.query.join(this.query_other).set_name(this.item_id + '_joined')
        this.query_override.render_templates(ds.context().variables)
        }
    }

    this.on('change:query', function(e) {
    update_query()
    }).on('change:query_other', function(e) {
    update_query()
    }).on('change:dashboard', function(e) {
    update_query()
    })
    update_query()
      */

      toJSON() : any {
        var data = super.toJSON()
        data.format = this.format
        data.striped = this.striped
        data.sortable = this.sortable
        data.title = this.title
        if (this.query_other) {
          if (this.query_other instanceof ts.models.data.Query) {
            data.query_other = (<ts.models.data.Query>this.query_other).name
          } else {
            data.query_other = this.query_other
          }
        }
        return data
      }

      data_handler(query: ts.models.data.Query) : void {
        var body = $('#' + this.item_id + ' tbody')
        var now  = query.data[0].summation
        var then = query.data[1].summation
        var diff = new ts.models.data.Summation(now).subtract(then)
        var properties = ['mean', 'min', 'max', 'sum']
        var float_margin = 0.000001
        properties.forEach((prop) => {
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
        body.append(ds.templates.models.comparison_summation_table_body({
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

      interactive_properties(): PropertyListEntry [] {
        return [
          { name: 'striped', type: 'boolean' },
          { name: 'sortable', type: 'boolean' },
          'format',
          'title',
          'query',
          {
            name: 'query_other',
            category: 'base',
            template: '{{item.query_other.name}}',
            edit_options: {
              type: 'select',
              source: function() {
                var queries = ds.manager.current.dashboard.definition.queries
                return Object.keys(queries).map(function(k) {
                  return { value: k, text: k }
                })
              },
              value: function(item) {
                return item.query_other ? item.query_other.name : undefined
              }
            }
          },
          {
            name: 'css_class', category: 'base'
          }
        ]
      }
    }
    ts.models.register_dashboard_item(ComparisonSummationTable)
  }
}
