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

These item type have a visual component linked to one or more data queries.

* `simple_time_series`
* `standard_time_series`
* `stacked_area_chart`
* `donut_chart`
* `singlegraph`
* `singlestat`
* `jumbotron_singlestat`
* `summation_table`
* `timeshift_summation_table`
