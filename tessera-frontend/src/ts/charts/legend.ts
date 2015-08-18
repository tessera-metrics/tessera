import Chart, { ChartLegendType } from '../models/items/chart'
import Query from '../models/data/query'
import { get_colors, get_palette } from './util'

declare var $, ts

export function render_legend(item: Chart, query: Query, options?: any) {
  let legend_id = '#ds-legend-' + item.item_id
  options = options || get_default_options()
  if ( item.legend === ChartLegendType.SIMPLE ) {
    render_simple_legend(legend_id, item, query, options)
  } else if ( item.legend === ChartLegendType.TABLE ) {
    render_table_legend(legend_id, item, query, options)
  }
}

function render_simple_legend(legend_id: string, item: Chart, query: Query, options?: any) {
  let legend = ''
  let data = query.chart_data('flot')
  for (let i = 0; i < data.length; i++) {
    let series = data[i]
    if (item.hide_zero_series && series.summation.sum === 0) {
      continue
    }
    let label = series.label
    let color = options.colors[i % options.colors.length]

    let cell = '<div class="ds-legend-cell">'
      + '<span class="color" style="background-color:' + color + '"></span>'
      + '<span class="label" style="color:' + options.xaxis.font.color +  '">' + label + '</span>'
      + '</div>'
    legend += cell
  }
  let elt = $(legend_id)
  elt.html(legend)
  elt.equalize({equalize: 'outerWidth', reset: true })
}

function render_table_legend(legend_id: string, item: Chart, query: Query, options?: any) {
  let palette = get_palette(item.options.palette || options.palette)
  query.data.forEach((series, i) => {
    series['color'] = palette[i % palette.length]
  })
  let data = query.data
  if (item.hide_zero_series)
    data = data.filter(s => s.summation.sum != 0)
  let legend = ts.templates.flot.table_legend({
    item: item,
    data: data,
    opt: options
  })
  $(legend_id).html(legend)
}

function get_default_options() {
  return {
    colors: get_palette(),
    xaxis: {
      font: {
        color: 'black'
      }
    }
  }
}
