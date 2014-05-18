ds.charts = ds.charts || {}

ds.charts.graphite =
  (function () {

    var self = {}

    self.DEFAULT_BGCOLOR = 'ff000000'

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

    self.simple_line_chart = function(item, options_) {
        var options = ds.extend(options_ || {}, getColors())
        var png_url = URI(item.query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || self.DEFAULT_BGCOLOR)
            .setQuery('fgcolor', options.fgcolor || 'white')
            .setQuery('hideLegend', 'true')
            .setQuery('hideAxes', 'true')
            .setQuery('margin', '0')
            .setQuery('colorList', ds.charts.util.get_palette(item.options.palette).join())
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    }

    self.standard_line_chart = function(item, options_) {
        var options = ds.extend(options_ || {}, getColors())
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
            .setQuery('colorList', ds.charts.util.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    }

    self.simple_area_chart = function(item, options_) {
        var options = ds.extend(options_ || {}, getColors())
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
            .setQuery('colorList', ds.charts.util.get_palette(item.options.palette).join())
            .href();
        return png_url;
    }

    self.stacked_area_chart = function(item, options_) {
        var options = ds.extend(options_ || {}, getColors())
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
            .setQuery('colorList', ds.charts.util.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    }

    self.chart_url = function(item, options) {
        switch (item.item_type) {
        case 'simple_time_series':
            return item.filled
                ? self.simple_area_chart(item, options)
                : self.simple_line_chart(item, options);
        case 'standard_time_series':
            return self.standard_line_chart(item, options);
        case 'stacked_area_chart':
            return self.stacked_area_chart(item, options);
        case 'singlegraph':
            return self.simple_area_chart(item, options);
        }
        return undefined;
    }

    self.composer_url = function(item, options_) {
        var options = options_ || {};
        var composer_url = URI(item.query.url())
            .filename('composer')
            .removeQuery('format')
            .setQuery('colorList', ds.charts.util.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '');
        if (item.item_type === 'stacked_area_chart') {
            composer_url.setQuery('areaMode', 'stacked');
        }
        return composer_url.href();
    }

    return self

  })()
