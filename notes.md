### Transforms

Given current state of pushState handling, hiding transform menu items
in transform mode is good.  When browser history handling is cleaner,
however, being able to replace current transform in-place might be
good.

I.e. after applying the TimeSpan transform, you might then want to
apply Isolate to one of them.

Oh, wait -- that's compositing transforms. Easy to do in the model,
much trickier to handle in the UX. Still....worth investigating.

example URI: ``/dashboard/1/slug/d4/TimeShift/d2/Isolate``

#### Isolate

- Could add a view of the graphite targets as well, in a tab (similar
  to the Instrument view from Opendash)

Aha! Isolate is a good pattern for editing individual graphs


#### Edit Graph

Edit of individual presentations:

- Add 'Edit presentation' action to the presentation action menu
- Note: menu is only available on charts, currently. Should apply it
  to all presentations.

- Display just like the Isolate transform - bring the graph up large,
  interactive. Instead of just a summation table, show a tabbed panel
  with the following tabs:
      - Query
      - Display, for presentation type & associated options
      - General, for title, basic style attributes

- obviously, will not be a transform, since the UI is not a bunch of
  dashboard items, but same general interaction (replace #dashboard in
  DOM, manipulate browser history)


#### Series representation

Introduced ds.charts.process_series to handle transforming from
graphite's JSON format to d3 or flot format. For snapshots, will need
to store in canoncical format and transform on render.


## Flot

- format values using d3.format() according to item
- preserve that formatting in the tooltip
- rework the tooltip to look closer to the one in nvd3
