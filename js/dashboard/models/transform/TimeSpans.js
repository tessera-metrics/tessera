/**
 * Transform a view of a single graph into viewing that graph over
 * multiple time spans. The item being transformed should be a single
 * presentation, not a composite (i.e. not a cell, row, section, or
 * dashboard).
 *
 * The time periods can be customized by passing an array of objects
 * with from/until/title properties
 *
 * Input => A single presentation
 *
 * Output => A section with a list of copies of the presentation with
 *           immediate query objects that override the time period
 */
ds.transforms.register({
  name:           'TimeSpans',
  display_name:   'View across time spans',
  transform_type: 'presentation',
  icon: '          fa fa-clock-o',

  transform: function(item) {
    var make  = ds.models.make
    var spans = [
      { from: '-1h', title: 'Past Hour' },
      { from: '-4h', title: 'Past 4 Hours' },
      { from: '-1d', title: 'Past Day' },
      { from: '-1w', title: 'Past Week' }
    ]
    var columns = 1
    var query   = item.query
    var colspan = 12 / self.columns
    var section = make('section')
                    .add(make('heading', {
                      level: 2, text: item.title
                                    ? 'Time Spans - ' + item.title
                                    : 'Time Spans' }))
                    .add(make('separator'))

    section.add(make('cell')
                  .set_span(colspan)
                  .set_style('well')
                  .add(item.set_title('Original')))
           .add(make('separator'))

    for (var i = 0; i < spans.length; i++) {
      var span = spans[i]
      var modified_query = ds.models.data.Query(query.toJSON())
                             .set_name(query.name + '/' + span.from + '/' + span.until)
                             .set_options(ds.extend(query.options || {},
                                                  {
                                                    from: span.from,
                                                    until: span.until
                                                  }))
      var modified_item = ds.models.factory(item.toJSON())
                            .set_item_id(undefined)
                            .set_query(modified_query)
                            .set_title(span.title)

      section.add(make('cell')
                  .set_span(colspan)
                  .add(modified_item))
    }

    return section
  }
})
