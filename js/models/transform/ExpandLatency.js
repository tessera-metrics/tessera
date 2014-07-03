/**
 * Latency - expand a single latency metric into all the percentiles,
 * based on metrics produced by Coda Hale's Metrics library for Java.
 */
ds.transforms.register({
  name: 'ExpandLatency',
  display_name: 'Expand Latency',
  transform_type: 'presentation',

  toJSON: function() {
    return { name: 'ExpandLatency' }
  },

  transform: function(item) {
    'use strict'
    var make        = ds.models.make
    var root_metric = item.query.targets[0]
    root_metric = root_metric.substring(0, root_metric.lastIndexOf('.'))

    console.log('ExpandLatency.transform(): root_metric = ' + root_metric)

    function span(width, item) {
      return make('cell').set_span(width).add(item)
    }

    var metrics = [
      'Max',
      '999thPercentile',
      '99thPercentile',
      '95thPercentile',
      '75thPercentile',
      '50thPercentile',
      'Mean',
      'Min'
    ]
    var queries = {}

    var individual_rows
          = metrics.map(function(m) {
              var metric = root_metric + '.' + m
              var query = ds.models.data.Query({
                name: item.query.name + '_' + m,
                targets: [ metric ]
              })
              queries[m] = query
              return make('row')
                     .add(span(8, make('standard_time_series')
                                    .set_title(m)
                                    .set_height(3)
                                    .set_query(query)))
                       .add(span(2, make('singlestat')
                                      .set_query(query)
                                      .set_format(',.3s')
                                      .set_transform('max')
                                      .set_title('Max of ' + m))
                              .set_align('right'))
                       .add(span(2, make('singlestat')
                                      .set_query(query)
                                      .set_format(',.3s')
                                      .set_transform('mean')
                                      .set_title('Average of ' + m)))
            })

    /* TODO: being able to configure which percentile is highlighted
     * at the top would be good */
    var section = make('section')
                    .add(make('row')
                           .add(span(8, make('standard_time_series')
                                          .set_query(queries['95thPercentile'])
                                          .set_title('95th Percentile Latency')
                                          .set_height(5))
                                  .set_style('well'))
                           .add(span(4, make('cell')
                                          .add(make('jumbotron_singlestat')
                                                 .set_title('Peak 95th Percentile')
                                                 .set_query(queries['95thPercentile'])
                                                 .set_units('ms')
                                                 .set_format(',.3s')
                                                 .set_transform('max')))))
                    .add(make('separator'))
    individual_rows.forEach(function(row) {
      section.add(row)
    })
    return section
  }
})
