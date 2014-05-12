/**
 * Transform a view of a single graph into viewing multiple of that
 * graph at the same temporal resolution but shifted by one or more
 * time periods.
 */
ds.models.transform.TimeShift = function(options) {
  'use strict'

  var self =
    limivorous.observable()
              .property('columns', {init: 1})
              .property('comparison_table', {init: false}) /** TODO: include a comparison summation table in the expansion */
              .property('shifts', {
                init: [
                  { shift:  '-1h', title: 'Back One Hour' },
                  { shift: '-12h', title: 'Back 12 Hours' },
                  { shift:  '-1d', title: 'Back One Day'  },
                  { shift:  '-2d', title: 'Back Two Days' },
                  { shift:  '-1w', title: 'Back One Week' }
                ]
              })
              .extend(ds.models.transform.transform, {
                transform_name: 'Time Shift',
                transform_type: 'time_shift'
              })
              .build()

  self.transform = function(item) {
    var query   = item.query
    var section = ds.models.section()
    var colspan = 12 / self.columns

    /* Include the original */
    section.add(item)

    for (var i in self.shifts) {
      var shift = self.shifts[i]

      var modified_query = ds.models.data.Query(query.toJSON())
                             .set_name(query.name + '/' + shift.shift)
                             .set_targets(query.targets.map(function(target) {
                                            return 'timeShift(' + target + ', "' + shift.shift + '")'
                                          }))

      console.log(JSON.stringify(modified_query, null, '  '))

      var modified_item = ds.models.factory(item.toJSON())
                            .set_query(modified_query)
                            .set_title(item.title
                                      ? shift.title + ' - ' + item.title
                                      : shift.title)
      section.add(ds.models.cell()
                  .set_span(colspan)
                  .add(modified_item))
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
