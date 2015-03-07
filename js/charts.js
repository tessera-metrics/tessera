/**
 * ds.charts exposes the generic interface to rendering a chart for a
 * dashboard item. It delegates all calls to the currently assigned
 * implementation in the provider property.
 *
 * Chart providers must each implement the following functions:
 *
 *   * simple_line_chart
 *   * standard_line_chart
 *   * simple_area_chart
 *   * stacked_area_chart
 *   * donut_chart
 *   * bar_chart
 *   * discrete_bar_chart
 *   * process_series
 */
ds.charts =
  (function () {

    var self = limivorous.observable()
                         .property('provider')
                         .property('interactive', {init: false})
                         .build()

    self.DEFAULT_PALETTE = 'spectrum6'
    self.perf = ds.perf('ds.charts')

    self.registry = ds.registry({
      name: 'chart-provider',
      process: function(data) {
        if (data.is_chart_provider)
          return data
        return ds.charts.provider(data)
      }
    })

    function get_renderer(fn_name, item) {
      var interactive = self.interactive
      if ((typeof(item) !== 'undefined') && (typeof(item.interactive) !== 'undefined'))
        interactive = item.interactive
      var renderer = interactive ? self.provider[fn_name] : ds.charts.graphite[fn_name]

      return function() {
        self.perf.start('render')
        try {
          return renderer(arguments[0], arguments[1], arguments[2])
        } finally {
          self.perf.end('render')
        }
      }
    }

    /**
     * Render a minimal line chart into element.
     */
    self.simple_line_chart = function(element, item, query) {
      return get_renderer('simple_line_chart', item)(element, item, query)
    }

    /**
     * Render a complete line chart into element.
     */
    self.standard_line_chart = function(element, item, query) {
      return get_renderer('standard_line_chart', item)(element, item, query)
    }

    /**
     * Render a minimal area chart into element.
     */
    self.simple_area_chart = function(element, item, query) {
      return get_renderer('simple_area_chart', item)(element, item, query)
    }

    /**
     * Render a complete area chart into element.
     */
    self.stacked_area_chart = function(element, item, query) {
      return get_renderer('stacked_area_chart', item)(element, item, query)
    }

    /**
     * Render a donut/pie chart into element.
     */
    self.donut_chart = function(element, item, query) {
      return get_renderer('donut_chart', item)(element, item, query)
    }

   /**
     * Render an historical bar chart into element.
     */
    self.bar_chart = function(element, item, query) {
      return get_renderer('bar_chart', item)(element, item, query)
    }

   /**
     * Render a bar chart of the data series' summations into
     * element. The x-axis will be the series names, rather than time.
     */
    self.discrete_bar_chart = function(element, item, query) {
      return get_renderer('discrete_bar_chart', item)(element, item, query)
    }

    /**
     * Convert the JSON data series returned from Graphite into the
     * format used by the current chart provider.
     *
     * @param type {string} Override the currently configured chart
     *                      provider.
     */
    self.process_series = function(series, type) {
      var processed = null
      if (type) {
        processed = ds.charts.registry.get(type).process_series(series)
      } else {
        processed = self.provider.process_series(series)
      }
      /* Ensure that a common target variable is always there for non-chart presentations to use */
      processed.target = series.target
      return processed
    }

    /**
     * Process a data series or array of data series from Graphite's
     * JSON format to the format expected by the charting provider.
     *
     * @param type {string} Override the currently configured chart
     *                      provider.
     */
    self.process_data = function(data, type) {
      if (!data)
        return []
      if (data instanceof Array) {
        return data.map(function(series) {
                 return self.process_series(series, type)
               })
      } else {
        return [ self.process_series(data) ]
      }
    }

    self.StackMode = {
      NONE:    'none',
      NORMAL:  'stack',
      PERCENT: 'percent',
      STREAM:  'stream'
    }

    return self

  })()

/**
 * Utils relating to a collection of bundled color palettes for use in
 * rendering charts.
 */
ds.charts.util =
  (function () {
    var self = {}

    self.get_palette = function(name) {
      if (name instanceof Array)
        return name
      var palette = self.colors[name];
      return palette || self.colors[ds.charts.DEFAULT_PALETTE];
    }

    /**
     * Return a set of colors for rendering graphs that are tuned to
     * the current UI color theme. Colors are derived from the
     * background color of the 'body' element.
     *
     * TODO: cache the results keyed by background color.
     *
     * TODO: if the model had back links to containers, we could walk
     * up the containment hierarchy to see if the chart is contained
     * in something that has a background style set (i.e. well, alert,
     * etc...) and get the colors based on that.
     *
     * Or we could just pre-compute them all based on the background
     * colors from the CSS.
     */
    self.get_colors = function() {
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

    /**
     * Return a low contrast monochromatic color palette for
     * transforms like HighlightAverage, which de-emphasize a mass of
     * raw metrics in order to highlight computed series.
     */
    self.get_low_contrast_palette = function() {
      /* TODO: get from options parameter */
      var light_step = 0.1
        , dark_step  = 0.05
        , count      = 6
        , bg    = Color(window.getComputedStyle($('body')[0]).backgroundColor)
        , color = bg.dark() ? bg.clone().lighten(0.25) : bg.clone().darken(0.1)

      var palette = []
      for (var i = 0; i < count; i++) {
        palette.push(color.hexString())
        bg.dark() ? color.lighten(light_step) : color.darken(dark_step)
      }

      return palette
    }

    self._color_function = function(palette_name) {
        var palette = self.colors[palette_name];
        if (!palette) {
            palette = self.colors[ds.charts.DEFAULT_PALETTE];
        }
        return function(d, i) {
            return palette[i % palette.length];
        }
    }

    /**
     * Some color palettes", handily compiled by the Stanford Vis
     * Group for their Color Palette Analyzer project.
     * http://vis.stanford.edu/color-names/analyzer/
     */
    self.colors = {
      applespectrum:[ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
        appleblue:    [ "#4972a8", "#92b9d8", "#002d64", "#599bcf", "#134d8d" ],
        applebrown:   [ "#8b6c4f", "#c8b68e", "#3b291d", "#ae8e5d", "#713f24" ],
        applegrey:    [ "#717372", "#c0c2c1", "#2d2f2e", "#8c8e8d", "#484a49" ],
        applegreen:   [ "#2d632f", "#90b879", "#0d2d16", "#599a48", "#00431a" ],
        tableau10:    [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                        "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
        tableau20:    [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                        "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                        "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                        "#17becf", "#9edae5" ],
        manyeyes:     [ "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252",
                        "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c",
                        "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194",
                        "#7b4173" ],
        numbers6:     [ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
        excel10:      [ "#365e96", "#983334", "#77973d", "#5d437c", "#36869f", "#d1702f",
                        "#8197c5", "#c47f80", "#acc484", "#9887b0" ],
        economist:    [ "#621e15", "#e59076", "#128dcd", "#083c52", "#64c5f2", "#61afaf",
                        "#0f7369", "#9c9da1" ],
        brewerq9:     [ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33",
                        "#a65628", "#f781bf", "#999999" ],
        brewerq10:    [ "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
                        "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a" ],
        brewerq12:    [ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
                        "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f" ],
        brewerdiv1:   [ "#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac",
                        "#01665e" ],
        brewerdiv2:   [ "#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf",
                        "#2166ac" ],
        brewerdiv3:   [ "#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b",
                        "#1b7837" ],
        brewerdiv4:   [ "#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb",
                        "#4575b4" ],
        marketmap :   [ "#fa0007", "#ac0000", "#4e0300", "#000000", "#005101", "#06a200",
                        "#07ff00" ],


        // some more color palettes from rickshaw
        spectrum6:  ["#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                     "#649eb9", "#387aa3"].reverse(),
        spectrum14:  ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82",
                      "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                      "#649eb9", "#387aa3"].reverse(),
        spectrum2000:["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665",
                      "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d",
                      "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839",
                      "#31082b"],
        spectrum2001:["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f",
                      "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412",
                      "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818",
                      "#320a1b"],
        classic9:    ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f",
                      "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(),
        colorwheel:  ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac",
                      "#73c03a", "#cb513a"].reverse(),
        cool:        ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266",
                      "#a47493", "#c09fb5"],
        munin:       ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099",
                      "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00",
                      "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80",
                      "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080",
                      "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"],

        // some more color palettes from d3.js
        d3category10: [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                        "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],

        d3category20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                       "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                       "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                       "#17becf", "#9edae5" ],

        d3category20b: [ "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252",
                         "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
                         "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
                         "#ce6dbd", "#de9ed6" ],

        d3category20c: ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c",
                        "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
                        "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696",
                        "#bdbdbd", "#d9d9d9"],

      // Here are a couple of intentionally low-contrast palettes
      // which intended to allow computed series (like
      // averageSeries(), highestAverage(), mostDeviant(), etc...) to
      // stand out over the noise of a ton of metric instances when
      // assigned their own color with the color() function.

      low_contrast_gray : [ "#BBBBBB","#C8C8C8","#D5D5D5","#E1E1E1","#EEEEEE" ],
      low_contrast_blue : [ "#AAAABB","#B7B7C8","#C4C4D5","#D0D0E1","#DDDDEE", "#EAEAFB" ]

    }

    return self

  })()
