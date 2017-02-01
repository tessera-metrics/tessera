---
layout: docs
title: Data Format
category: Documentation
doc_section: API
doc_title: JSON Data Format
---

## Dashboard

## Dashboard Items

All dashboard items share a common structure. Each is a JSON dictionary with an `item_type` attribute indicating what type of dashboard item it is. Item types generally fall into two categories - _structural_ elements, which control dashboard layout, and _presentations_, which create some visible output in the rendered dashboard.

### Structural Item Types

* `dashboard_definition`
* `section`
* `row`
* `cell`

### Presentation Types

These item types have a visual component, but do not consume data from queries.

* `heading`
* `separator`
* `markdown`

### Data Presentation Types

These item type have a graphical or textual component linked to one or
more data queries.


#### Charts

* [`simple_time_series`](../../items/simple_time_series)
* [`standard_time_series`](../../items/standard_time_series)
* [`donut_chart`](../../items/donut_chart)
* [`bar_chart`](../../items/bar_chart)
* [`discrete_bar_chart`](../../items/discrete_bar_chart)
* [`singlegraph`](../../items/singlegraph)
* [`singlegraph_grid`](../../items/singlegraph_grid)
* [`scatter_plot`](../../items/scatter_plot)

#### Text Presentations

* [`singlestat`](../../items/singlestat)
* [`timeshift_singlestat`](../../items/timeshift_singlestat)
* [`comparison_singlestat`](../../items/comparison_singlestat)
* [`jumbotron_singlestat`](../../items/jumbotron_singlestat)
* [`timeshift_jumbotron_singlestat`](../../items/timeshift_jumbotron_singlestat)
* [`comparison_jumbotron_singlestat`](../../items/comparison_jumbotron_singlestat)
* [`timerstat`](../../items/timerstat)
* [`summation_table`](../../items/summation_table)
* [`timeshift_summation_table`](../../items/timeshift_summation_table)
* [`comparison_summation_table`](../../items/comparison_summation_table)
* [`percentage_table`](../../items/percentage_table)
