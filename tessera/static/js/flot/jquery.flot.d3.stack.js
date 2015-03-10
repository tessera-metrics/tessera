(function ($) {
  var options = {
      series: {
        stackD3: {
          show: false
        }
      }
  }

  function init(plot) {
    var stack = d3.layout.stack()
                  .values(function(series) { return series.data } )
                  .x(function(d) { return d[0] })
                  .y(function(d) { return d[1] })
    var stacked = null

    function processRawData(plot, series) {
      if (!series.stackD3 || (series.stackD3 && !series.stackD3.show))
        return
      if (!stacked) {
        stack.offset(series.stackD3.offset || 'wiggle')
        stacked = stack(plot.getData())
      }
    }

    function streamData(plot, series, datapoints) {
      if (!series.stackD3 || (series.stackD3 && !series.stackD3.show))
        return
      var newpoints = []
      var percents = []
      series.data.forEach(function(point) {
        newpoints.push(point[0])
        newpoints.push(point.y0 + point[1])
        newpoints.push(point.y0)
        percents.push(point.y)
      })
      if (series.stackD3.offset === 'expand')
        series.percents = percents
      datapoints.points = newpoints
    }

    plot.hooks.processRawData.push(processRawData)
    plot.hooks.processDatapoints.push(streamData)
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'stackD3',
    version: '1.0'
  })

})(jQuery);
