import Chart, { ChartLegendType } from '../models/items/chart'
import Query from '../models/data/query'
import { get_colors, get_palette } from './util'
import { get_renderer } from './core'

declare var $, ts

function highlightSeries(item) {
  return function(e) {
    var index = e.currentTarget.dataset.seriesIndex
    get_renderer(item).highlight_series(item, index)
  }
}

function unhighlightSeries(item) {
  return function(e) {
    get_renderer(item).unhighlight_series(item)
  }
}

export function render_legend(item: Chart, query: Query, options?: any) {
  let legend_id = '#ds-legend-' + item.item_id
  if ( item.legend === ChartLegendType.SIMPLE ) {
    render_simple_legend(legend_id, item, query, options)
  } else if ( item.legend === ChartLegendType.TABLE ) {
    render_table_legend(legend_id, item, query, options)
  }
}

function render_simple_legend(legend_id: string, item: Chart, query: Query, options: any = {}) {
  let legend = ''
  let data = query.chart_data('flot')
  let theme_colors = get_colors()
  let colors = get_palette(options.palette || item.options.palette)
  for (let i = 0; i < data.length; i++) {
    let series = data[i]
    if (item.hide_zero_series && series.summation.sum === 0) {
      continue
    }
    let label = series.label
    let color = colors[i % colors.length]

    let cell = '<div class="ds-legend-cell" data-series-index="' + i + '">'
      + '<span class="color" style="background-color:' + color + '"></span>'
      + '<span class="label" style="color:' + theme_colors.fgcolor +  '">' + label + '</span>'
      + '</div>'
    legend += cell
  }
  let elt = $(legend_id)
  elt.html(legend)
  elt.equalize({equalize: 'outerWidth', reset: true })
  if (options.interactive_legend) {
    let elt = $(legend_id + ' .ds-legend-cell')
    elt.on('mouseenter', highlightSeries(item))
    elt.on('mouseenter', (e) => {
      $(e.currentTarget).addClass('highlighted')
    })
    elt.on('mouseleave', unhighlightSeries(item))
    elt.on('mouseleave', (e) => {
      $(e.currentTarget).removeClass('highlighted')
    })
  }
}

function render_table_legend(legend_id: string, item: Chart, query: Query, options: any = {}) {
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

  if (options.interactive_legend) {
    $(legend_id + ' > table > tbody > tr').on('mouseenter', highlightSeries(item))
    $(legend_id + ' > table > tbody > tr').on('mouseleave', unhighlightSeries(item))
  }
}
