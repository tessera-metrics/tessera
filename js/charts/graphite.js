ds.charts = ds.charts || {}

/**
 * Charts provider for Graphite's built-in static image
 * rendering. Also provides Graphite URL formatting for a number of
 * the UI's actions (Open in Graphite..., Export PNG..., etc...)
 */
ds.charts.graphite =
  (function () {

    var self = {}

    self.DEFAULT_BGCOLOR = 'ff000000'

    /**
     * Return a set of colors for rendering graphs that are tuned to
     * the current UI color theme. Colors are derived from the
     * background color of the 'body' element.
     */
    function getColors() {
      var color = Color(window.getComputedStyle($('body')[0]).backgroundColor)
      if (color.dark()) {
        return {
          majorGridLineColor: color.clone().lighten(0.75).hexString(),
          minorGridLineColor: color.clone().lighten(0.5).hexString(),
          fgcolor: color.clone().lighten(3.0).hexString()
        }
      } else {
        return {
          majorGridLineColor: color.clone().darken(0.15).hexString(),
          minorGridLineColor: color.clone().darken(0.05).hexString(),
          fgcolor: color.clone().darken(0.75).hexString()
        }
      }
    }

    function img(element, url) {
      element.html($('<img/>')
                     .attr('src', url)
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
        var options = ds.extend(opt || {}, item.options, getColors())
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
            .href()
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
        var options = ds.extend(opt || {}, item.options, getColors())
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
            .setQuery('vtitle', options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href()
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
        var options = ds.extend(opt || {}, item.options, getColors())
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
            .setQuery('areaMode', 'stacked')
            .setQuery('margin', '0')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .href()
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
        var options = ds.extend(opt || {}, item.options, getColors())
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
            .setQuery('areaMode', 'stacked')
            .setQuery('colorList', ds.charts.util.get_palette(options.palette).join())
            .setQuery('vtitle', options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href()
        return png_url
    }

    self.donut_chart_url = function(item, opt) {
      var png_url = URI(self.standard_line_chart_url(item, opt))
                            .setQuery('graphType', 'pie')
                            .href()
        return png_url
    }


    self.donut_chart = function(element, item, query) {
      var url = self.donut_chart_url(item, {
        height: element.height(),
        width: element.width()
      })
      img(element, url)
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
        if (item.item_type === 'stacked_area_chart') {
            composer_url.setQuery('areaMode', 'stacked')
        }
        return composer_url.href()
    }

    return self

  })()
