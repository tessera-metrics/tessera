/**
 * Charts provider for Graphite's built-in static image
 * rendering. Also provides Graphite URL formatting for a number of
 * the UI's actions (Open in Graphite..., Export PNG..., etc...)
 */
ds.charts.graphite =
  (function () {

    var self = ds.charts.provider({
      name: 'graphite',
      is_interactive: false,
      description: ''
    })

    self.DEFAULT_BGCOLOR = 'ff000000'

    function img(element, url) {
      element.html($('<img/>')
                     .attr('src', url.href())
                     .height(element.height())
                     .width(element.width()))
    }

    self.simple_line_chart = function(element, item, query) {
      var url = self.simple_line_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
    }

    self.simple_line_chart_url = function(item, opt) {
        var options = ds.extend(opt || {}, item.options, ds.charts.util.get_colors())
        var png_url = URI(item.query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || self.DEFAULT_BGCOLOR)
            .setQuery('fgcolor', options.fgcolor || 'white')
            .setQuery('hideLegend', 'true')
            .setQuery('hideAxes', 'true')
            .setQuery('margin', '0')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .setQuery('title', options.showTitle ? item.title : '')

        if (options.y1 && options.y1.min)
            png_url.setQuery('yMin', options.y1.min )
        if (options.y1 && options.y1.max)
            png_url.setQuery('yMax', options.y1.max )

        return png_url
    }

    self.standard_line_chart = function(element, item, query) {
      var url = self.standard_line_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
    }

    self.standard_line_chart_url = function(item, opt) {
        var options = ds.extend(opt || {}, item.options, ds.charts.util.get_colors())
        var png_url = URI(item.query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || self.DEFAULT_BGCOLOR)
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', options.hideLegend || 'false')
            .setQuery('hideAxes', options.hideAxes || 'false')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')

        if (options.y1 && options.y1.min)
            png_url.setQuery('yMin', options.y1.min )
        if (options.y1 && options.y1.max)
            png_url.setQuery('yMax', options.y1.max )

        return png_url
    }

    self.simple_area_chart = function(element, item, query) {
      var url = self.simple_area_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
    }

    self.simple_area_chart_url = function(item, opt) {
        var options = ds.extend(opt || {}, item.options, ds.charts.util.get_colors())
        var png_url = URI(item.query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || self.DEFAULT_BGCOLOR)
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', 'true')
            .setQuery('hideAxes', 'true')
            .setQuery('margin', '0')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())

        if (!item.query.is_stacked())
            png_url.setQuery('areaMode', 'stacked')

        if (options.y1 && options.y1.min)
            png_url.setQuery('yMin', options.y1.min )
        if (options.y1 && options.y1.max)
            png_url.setQuery('yMax', options.y1.max )

        return png_url
    }

    self.stacked_area_chart = function(element, item, query) {
      var url = self.stacked_area_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
    }

    self.stacked_area_chart_url = function(item, opt) {
        var options = ds.extend(opt || {}, item.options, ds.charts.util.get_colors())
        var png_url = URI(item.query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || self.DEFAULT_BGCOLOR)
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', options.hideLegend || 'false')
            .setQuery('hideAxes', options.hideAxes || 'false')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')

        if (!item.query.is_stacked())
            png_url.setQuery('areaMode', 'stacked')

        if (options.y1 && options.y1.min)
            png_url.setQuery('yMin', options.y1.min )
        if (options.y1 && options.y1.max)
            png_url.setQuery('yMax', options.y1.max )

        return png_url
    }

    self.donut_chart_url = function(item, opt) {
      var png_url = self.standard_line_chart_url(item, opt)
                        .setQuery('graphType', 'pie')
      if (!item.legend)
        png_url.setQuery('hideLegend', 'true')

      return png_url
    }

    self.donut_chart = function(element, item, query) {
      var url = self.donut_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
    }

    self.bar_chart = function(e, item, query) {
      return self.stacked_area_chart(e, item, query)
    }

    self.discrete_bar_chart = function(e, item, query) {
      return self.donut_chart(e, item, query)
    }

    self.chart_url = function(item, options) {
      switch (item.item_type) {
        case 'simple_time_series':
            return item.filled
                ? self.simple_area_chart_url(item, options)
                : self.simple_line_chart_url(item, options)
        case 'standard_time_series':
            return self.standard_line_chart_url(item, options)
        case 'stacked_area_chart':
            return self.stacked_area_chart_url(item, options)
        case 'singlegraph':
            return self.simple_area_chart_url(item, options)
        case 'donut_chart':
            return self.donut_chart_url(item, options)
        }
        return undefined
    }

    self.composer_url = function(item, options) {
        options = options || {}
        var composer_url = URI(item.query.url())
            .filename('composer')
            .removeQuery('format')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .setQuery('vtitle', options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
        if (item.item_type === 'stacked_area_chart' && !(item.query.is_stacked())) {
            composer_url.setQuery('areaMode', 'stacked')
        }
        return composer_url
    }

    ds.charts.registry.register(self)

    return self

  })()
