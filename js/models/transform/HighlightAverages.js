/**
 * Higlight the average, max average, and most deviant series. This
 * transform works best on line graphs with lots of metrics (for
 * example, CPU or disk usage across a cluster).
 *
 * TODO: enforcing that it not be used on stacked graphs would be
 * neat. Adding an `applicable_types` attribute or something could
 * control visibily of transforms, so they only appear for
 * presentations that they make sense for.
 */
ds.transforms.register({
  name:           'HighlightAverages',
  display_name:   'Highlight Averages',
  transform_type: 'presentation',

  transform: function(item) {
    var make    = ds.models.make
    var query   = item.query
    var group   = (query.targets.length > 1) ? 'group(' + query.targets.join(',') + ')' : query.targets[0]
    var bg      = Color(window.getComputedStyle($('body')[0]).backgroundColor)
    var palette = ds.charts.util.get_low_contrast_palette()

    /* Set up the modified queries */
    var query_averages = ds.models.data.Query({
      name: query.name + '_averages',
      targets: [
        group,
        'alias(lineWidth(color(averageSeries(' + group + '), "' + (bg.dark()
                                                                  ? bg.clone().lighten(4.0)
                                                                  : bg.clone().darken(1.0)).hexString()  + '"), 2), "Avg")',
        'alias(lineWidth(color(highestAverage(' + group + ', 1), "red"), 2), "Max Avg")'
      ]
    })
    var query_deviant = ds.models.data.Query({
      name: query.name + '_deviant',
      targets: [
        group,
        'alias(lineWidth(color(mostDeviant(' + group + ', 1), "red"), 2), "Most Deviant")'
      ]
    })

    /* Clone and modify the original */
    var item_averages = item.clone()
                            .set_item_type('standard_time_series')
                            .set_height(6)
                            .set_interactive(false)
                            .set_title("Average & Max Average")
                            .set_query(query_averages)
    item_averages.options.palette = palette
    item_averages.options.hideLegend = 'true'

    var item_deviant  = item.clone()
                            .set_item_type('standard_time_series')
                            .set_height(4)
                            .set_interactive(false)
                            .set_title('Most Deviant')
                            .set_query(query_deviant)
    item_deviant.options.palette = palette

    /* And put it all together */
    return make('section')
             .add(make('row')
                    .add(make('cell')
                           .set_span(12)
                           .set_style('well')
                           .add(item_averages)))
             .add(make('row')
                    .add(make('cell')
                           .set_span(12)
                           .add(item_deviant)))
             .add(make('separator'))
             .add(make('row')
                    .add(make('cell')
                           .set_span(12)
                           .add(item.set_title('Original'))))

  }

})
