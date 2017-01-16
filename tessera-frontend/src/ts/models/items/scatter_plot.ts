import XYChart from './xychart'
import Query from '../data/query'
import { DashboardItemMetadata } from './item'
import * as charts from '../../charts/core'
import * as app from '../../app'
import { extend, Template } from '../../util'
import { PropertyList } from '../../core/property'

declare var $

export default class ScatterPlot extends XYChart {
  static meta: DashboardItemMetadata = {
    icon: 'fa fa-circle'
  }

  protected _query_x : string
  protected _query_y : string

  constructor(data?: any) {
    super(data)
    if (data) {
      if (data.query_x && data.query_x.name) {
        this._query_x = data.query_x.name
      } else {
        this._query_x = data.query_x
      }
      if (data.query_y && data.query_y.name) {
        this._query_y = data.query_y.name
      } else {
        this._query_y = data.query_y
      }
    }
    // Override default legend type of 'simple' to 'none' if a legend
    // has not been set explicitly.
    if (!data || (data && typeof data.legend === 'undefined')) {
      this.legend = undefined
    }
  }

  render_templates(context?: any) : void {
    if (this.query_x) {
      this.query_x.render_templates(context)
    }
    if (this.query_y) {
      this.query_y.render_templates(context)
    }
  }

  /* Query Accessors ------------------------------ */

  _update_query() : void {
    if (this.query_x && this.query_y && this.dashboard) {
      this.query_override =
        this.query_x.join(this.query_y).set_name(`${this.item_id}_joined`)
      this.query_override.render_templates(app.context().variables)
    }
  }

  get query_x() : Query {
    if (!this.dashboard) {
      return null
    }
    return this.dashboard.definition.queries[this._query_x]
  }

  set query_x(value: Query) {
    this._query_x = value.name
    this._update_query()
  }

  set_query_x(value: string|Query) : ScatterPlot {
    if (typeof value === 'string') {
      this._query_x = value
    } else {
      this._query_x = value.name
    }
    return <ScatterPlot> this.updated()
  }

  get query_y() : Query {
    if (!this.dashboard) {
      return null
    }
    return this.dashboard.definition.queries[this._query_y]
  }

  set query_y(value: Query) {
    this._query_y = value.name
    this._update_query()
  }

  set_query_y(value: string|Query) : ScatterPlot {
    if (typeof value === 'string') {
      this._query_y = value
    } else {
      this._query_y = value.name
    }
    return <ScatterPlot> this.updated()
  }

  toJSON() : any {
    let data = super.toJSON()
    delete data['query']
    return extend(data, {
      query_x: this.query_x ? this.query_x.name : undefined,
      query_y: this.query_y ? this.query_y.name : undefined
    })
  }

  render() : string {
    this._update_query()
    console.log(this.query_override)
    return super.render()
  }

  data_handler(query: Query) : void {
    console.log(query)
    charts.scatter_plot(`#${this.item_id} .ds-graph-holder`, this, query)
  }

  interactive_properties() : PropertyList {
    return [
      'height',
      'title',
      'css_class',
      'chart.palette',
      'chart.legend',
      'chart.x-axis-label',
      'chart.y-axis-min',
      'chart.y-axis-max',
      'chart.y-axis-scale',
      {
        name: 'query_x',
        template: new Template('{{item.query_x.name}}'),
        edit_options: {
          type: 'select',
          source: function() {
            var queries = app.manager.current.dashboard.definition.queries
            return Object.keys(queries).map(function(k) {
              return { value: k, text: k }
            })
          },
          value: function(item) {
            return item.query_x ? item.query_x.name : undefined
          },
          update: function(item, value) {
            item.set_query_x(value)
          }
        }
      },
      {
        name: 'query_y',
        template: new Template('{{item.query_y.name}}'),
        edit_options: {
          type: 'select',
          source: function() {
            var queries = app.manager.current.dashboard.definition.queries
            return Object.keys(queries).map(function(k) {
              return { value: k, text: k }
            })
          },
          value: function(item) {
            return item.query_y ? item.query_y.name : undefined
          },
          update: function(item, value) {
            item.set_query_y(value)
          }
        }
      }
    ]
  }
}
