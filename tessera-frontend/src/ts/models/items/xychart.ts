import * as core from '../../core'
import Chart from './chart'
import Axis from '../axis'
import { PropertyList } from '../../core/property'

core.properties.register([{
  name: 'chart.y-axis-label',
  property_name: 'y-axis-label',
  category: 'chart',
  edit_options: {
    type: 'text',
    value: function(item) {
      if (item.options && item.options.y1) {
        return item.options.y1.label
      } else if (item.options) {
        /* legacy */
        return item.options.yAxisLabel
      } else {
        return undefined
      }
    },
    update: function(item, newValue) {
      if (!item.options) {
        item.options = {}
      }
      if (!item.options.y1) {
        item.options.y1 = new Axis()
      }
      item.options.y1.label = newValue
      item.updated()
    }
  }
}, {
  name: 'chart.y-axis-min',
  property_name: 'y-axis-min',
  category: 'chart',
  edit_options: {
    type: 'text',
    value: function(item) {
      return item.options && item.options.y1
        ? item.options.y1.min
        : undefined
    },
    update: function(item, newValue) {
      if (!item.options) {
        item.options = {}
      }
      if (!item.options.y1) {
        item.options.y1 = new Axis()
      }
      item.options.y1.min = newValue
      item.updated()
    }
  }
}, {
  name: 'chart.y-axis-max',
  property_name: 'y-axis-max',
  category: 'chart',
  edit_options: {
    type: 'text',
    value: function(item) {
      return item.options && item.options.y1
        ? item.options.y1.max
        : undefined
    },
    update: function(item, newValue) {
      if (!item.options) {
        item.options = {}
      }
      if (!item.options.y1) {
        item.options.y1 = new Axis()
      }
      item.options.y1.max = newValue
      item.updated()
    }
  }
}])

export default class XYChart extends Chart {
  constructor(data?: any) {
    super(data)
  }

  interactive_properties() : PropertyList {
    return super.interactive_properties().concat([
      'chart.y-axis-label',
      'chart.y-axis-min',
      'chart.y-axis-max'
    ])
  }
}
