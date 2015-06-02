import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import Axis from '../axis'
import * as core from '../../core'
import * as charts from '../../charts/core'
import PALETTES from '../../charts/palettes'

core.properties.register([{
  name:          'chart.palette',
  property_name: 'palette',
  category:      'chart',

  edit_options: {
    type: 'select',

    value: function(item) {
      if (item.options && item.options.palette) {
        return item.options.palette
      } else {
        return undefined
      }
    },

    source: [ { text: 'None', value: undefined } ]
      .concat(Object.keys(PALETTES).map(function(value, index) {
        return { text: value, value: value }
      })),

    update: function(item, newValue) {
      if (!item.options) {
        item.options = {}
      }
      item.options.palette = newValue
      item.updated()
    }
  }
}, {
  name: 'chart.renderer',
  property_name: 'renderer',
  category: 'chart',
  edit_options: {
    type: 'select',
    source: function() {
      return [undefined].concat([...charts.renderers.list().map(r => r.name)])
    }
  }
}])

export const ChartLegendType = {
  SIMPLE: 'simple',
  TABLE: 'table'
}

/**
 * Base class for all chart presentation types
 */
export default class Chart extends Presentation {
  static meta: DashboardItemMetadata = {
    category: 'chart'
  }

  legend: string = ChartLegendType.SIMPLE
  hide_zero_series: boolean = false
  renderer: string
  options: any = {}

  constructor(data?: any) {
    super(data)
    if (data) {
      if (typeof(data.legend) !== 'undefined') {
        this.legend = data.legend
        if (typeof(data.legend) === 'boolean')
          this.legend = data.legend ? ChartLegendType.SIMPLE : undefined
      }
      this.options = data.options || {}
      if (data.options && data.options.y1) {
        this.options.y1 = new Axis(data.options.y1)
      }
      if (data.options && data.options.y2) {
        this.options.y2 = new Axis(data.options.y2)
      }
      if (data.options && data.options.x) {
        this.options.x = new Axis(data.options.x)
      }
      if (typeof(data.hide_zero_series !== 'undefined')) {
        this.hide_zero_series = Boolean(data.hide_zero_series)
      }
      this.renderer = data.renderer
    }
  }

  set_renderer(renderer: string) : Chart {
    this.renderer = renderer
    return <Chart> this.updated()
  }

  toJSON() : any {
    let data = core.extend(super.toJSON(), {
      legend: this.legend,
      hide_zero_series: this.hide_zero_series,
      renderer: this.renderer
    })
    if (this.options) {
      data.options = core.extend({}, this.options)
      if (this.options.y1) {
        data.options.y1 = core.json(this.options.y1)
      }
      if (this.options.y2) {
        data.options.y2 = core.json(this.options.y2)
      }
      if (this.options.x) {
            data.options.x = core.json(this.options.x)
      }
    }
    return data
  }

  /**
   * Clearly, a bunch of this should be refactored into a common
   * model. Should probably make chart.options a property model object.
   */
  interactive_properties() : core.PropertyList {
    let props = [
      'title',
      'height',
      {
        name: 'hide_zero_series',
        type: 'boolean',
        category: 'chart'
      },
      'chart.renderer',
      'chart.palette',
      {
        name: 'chart.legend',
        property_name: 'legend',
        category: 'chart',
        edit_options: {
          type: 'select',
          source: [
            { value: undefined, text: 'none' },
            'simple',
            'table'
          ]
        }
      }
    ]
    return super.interactive_properties().concat(props)
  }
}
