import { extend, json } from '../../util'
import Presentation from './presentation'
import { DashboardItemMetadata } from './item'
import Axis from '../axis'
import { properties, PropertyList } from '../../core'
import * as charts from '../../charts/core'
import PALETTES from '../../charts/palettes'

properties.register([{
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
  name: 'chart.fill',
  property_name: 'fill',
  category: 'chart',
  type: 'select',
  edit_options: {
    source: [
      { value: undefined, text: 'default' },
      { value: 0.1, text:  '10%' },
      { value: 0.2, text:  '20%' },
      { value: 0.3, text:  '30%' },
      { value: 0.4, text:  '40%' },
      { value: 0.5, text:  '50%' },
      { value: 0.6, text:  '60%' },
      { value: 0.7, text:  '70%' },
      { value: 0.8, text:  '80%' },
      { value: 0.9, text:  '90%' },
      { value: 1.0, text: '100%' }
    ],
    update: function(item, value) {
      if (value) {
        item.set_fill(Number(value))
      }
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
}, {
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
  render_context: any
  options: any = {}
  fill: number

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
      if (typeof data.fill === 'number') {
        this.fill = data.fill
      }
      this.renderer = data.renderer
    }
  }

  cleanup() : void {
    charts.cleanup(this)
  }

  set_renderer(renderer: string) : Chart {
    this.renderer = renderer
    return <Chart> this.updated()
  }

  set_fill(fill: number) : Chart {
    if (typeof fill === 'number') {
      this.fill = fill
      return <Chart> this.updated()
    }
  }

  toJSON() : any {
    let data = extend(super.toJSON(), {
      legend: this.legend,
      hide_zero_series: this.hide_zero_series,
      renderer: this.renderer
    })
    if (this.options) {
      data.options = extend({}, this.options)
      if (this.options.y1) {
        data.options.y1 = json(this.options.y1)
      }
      if (this.options.y2) {
        data.options.y2 = json(this.options.y2)
      }
      if (this.options.x) {
            data.options.x = json(this.options.x)
      }
    }
    if (typeof this.fill === 'number') {
      data.fill = this.fill
    }
    return data
  }

  /**
   * Clearly, a bunch of this should be refactored into a common
   * model. Should probably make chart.options a property model object.
   */
  interactive_properties() : PropertyList {
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
      'chart.fill',
      'chart.legend'
    ]
    return super.interactive_properties().concat(props)
  }
}
