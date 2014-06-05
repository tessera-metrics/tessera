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
                display_name: 'Time Shift',
                transform_name: 'TimeShift',
                transform_type: 'presentation'
              })
              .build()

  self.transform = function(item) {
    var query   = item.query
    var colspan = 12 / self.columns
    var section = ds.models.section()
                    .add(ds.models.heading({ level: 2, text: item.title
                                                 ? 'Time shift - ' + item.title
                                                 : 'Time shift' }))
                    .add(ds.models.separator())
                    .add(item)     /* Include the original */

    for (var i in self.shifts) {
      var shift = self.shifts[i]

      var modified_query = ds.models.data.Query(query.toJSON())
                             .set_name(query.name + '/' + shift.shift)
                             .set_targets(query.targets.map(function(target) {
                                            return 'timeShift(' + target + ', "' + shift.shift + '")'
                                          }))

      var modified_item = ds.models.factory(item.toJSON())
                            .set_item_id(undefined)
                            .set_query(modified_query)
                            .set_title(shift.title)

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
