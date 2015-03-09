(function ($) {
  var options = {
      series: {
        streamgraph: {
          show: false
        }
      }
  }

  function init(plot) {
    var stack = d3.layout.stack()
                  .offset('wiggle')
                  .values(function(series) { return series.data } )
                  .x(function(d) { return d[0] })
                  .y(function(d) { return d[1] })
    var stacked = null

    function processRawData(plot, series) {
      if (!series.streamgraph || (series.streamgraph && !series.streamgraph.show))
        return
      if (!stacked) {
        stacked = stack(plot.getData())
      }
    }

    function streamData(plot, series, datapoints) {
      if (!series.streamgraph || (series.streamgraph && !series.streamgraph.show))
        return
      var newpoints = []
      series.data.forEach(function(point) {
        newpoints.push(point[0])
        newpoints.push(point.y0 + point[1])
        newpoints.push(point.y0)
      })
      datapoints.points = newpoints
    }

    plot.hooks.processRawData.push(processRawData)
    plot.hooks.processDatapoints.push(streamData)
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'streamgraph',
    version: '1.0'
  })

})(jQuery);
