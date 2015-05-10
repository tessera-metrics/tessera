import * as charts from './core'
import Chart from '../models/items/chart'
import { extend } from '../core/util'

declare var $

function render(element, item) {
  element.html($('<img/>')
               .attr('src', 'holder.js/100px100p')
               .height(element.height())
               .width(element.width()))
}

/**
 * A chart renderer that uses Holder.js to render placeholder images.
 */
export default class PlaceholderChartRenderer extends charts.ChartRenderer {

  constructor(data?: any) {
    super(extend({}, data, {
      name: 'placeholder',
      description: 'Render placeholder images in place of actual charts.',
      is_interactive: false
    }))
  }

  simple_line_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  standard_line_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  simple_area_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  stacked_area_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  donut_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  bar_chart(element: any, item: Chart) : void {
    render(element, item)
  }

  discrete_bar_chart(element: any, item: Chart) : void {
    render(element, item)
  }

}
