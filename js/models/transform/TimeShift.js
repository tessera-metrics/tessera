/**
 * Transform a view of a single graph into viewing multiple of that
 * graph at the same temporal resolution but shifted by one or more
 * time periods.
 */
ds.models.transform.TimeShift = function(options) {
  'use strict'

  var self =
    limivorous.observable()
              .property('comparison_table', {init: false}) /** TODO: include a comparison summation table in the expansion */
              .property('shifts', {
                init: [
                  { shift:  '-1h', title: 'One Hour Ago' },
                  { shift: '-12h', title: '12 Hours Ago' },
                  { shift:  '-1d', title: 'One Day Ago'  },
                  { shift:  '-2d', title: 'Two Days Ago' },
                  { shift:  '-1w', title: 'One Week Ago' }
                ]
              })
              .extend(ds.models.transform.transform, {
                display_name: 'Time Shift',
                transform_name: 'TimeShift',
                transform_type: 'presentation'
              })
              .build()

  function make_row(query, item, style) {
    var row = ds.models.make('row')
                .set_style(style)
    row.add(ds.models.make('cell')
              .set_span(10)
              .add(item))
    row.add(ds.models.make('cell')
              .set_span(1)
              .set_align('right')
              .add(ds.models.make('singlestat')
                     .set_query(query)
                     .set_transform('sum')
                     .set_format(',.2s')
                     .set_title('Total')))
    row.add(ds.models.make('cell')
              .set_span(1)
              .set_align('left')
              .add(ds.models.make('singlestat')
                     .set_query(query)
                     .set_transform('mean')
                     .set_format(',.2s')
                     .set_title('Average')))
    return row
  }

  self.transform = function(item) {
    var query   = item.query
    // var colspan = 12 / self.columns
    var section = ds.models.make('section')
                    .add(ds.models.make({ item_type: 'heading',
                                             level: 2, text: item.title
                                                           ? 'Time shift - ' + item.title
                                                           : 'Time shift' }))
                    .add(ds.models.make('separator'))
                    .add(make_row(item.query, item, 'well'))
                    .add(ds.models.make('separator'))

    for (var i in self.shifts) {
      var shift = self.shifts[i]

      var modified_query = ds.models.data.Query(query.toJSON())
                             .set_name(query.name + '/' + shift.shift)
                             .set_targets(query.targets.map(function(target) {
                                            return 'timeShift(' + target + ', "' + shift.shift + '")'
                                          }))

      var modified_item = ds.models.make(item.toJSON())
                            .set_item_id(undefined)
                            .set_query(modified_query)
                            .set_title(shift.title)


      section.add(make_row(modified_query, modified_item))
    }

    return section
  }

  self.toJSON = function() {
    return ds.models.transform.transform.json(self, {
      shifts: self.shifts,
      columns: self.columns
    })
  }

  return self
}
