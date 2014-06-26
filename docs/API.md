# Tessera API

The API is implemented in [tessera/views.py](../tessera/views.py).

## Endpoints

### Dashboards

#### `/api/dashboard/`

Supported verbs: `GET`, `POST`

Retrieve a list of all dashboards or create a new dashboard. 

#### `/api/dashboard/<id>`

Supported verbs: `GET`, `PUT`, `DELETE`

Retrieve or update the metadata for a specific dashboard, or delete the entire dashboard. 

#### `/api/dashboard/<id>/definition`

Supported verbs: `GET`, `PUT`

Retrieve or update the definition (contents) of a specific dashboard. 

#### `/api/dashboard/tagged/<tag>`

Supported verbs: `GET`

Retrieve a list of all dashboards which have the specified tag applied. 

#### `/api/dashboard/category/<cat>`

Supported verbs: `GET`

Retrieve a list of all dashboards that belong to the specified category. 

#### `/api/dashboard/category/`

Supported verbs: `GET`

Retrieve a list of all defined categories. 

### Tags

#### `/api/tag/`

Supported verbs: `GET`

Retrieve a list of all defined tags, with the counts of how many dashboards each one is applied to. 

#### `/api/tag/<id>`

Supported verbs: `GET`, `PUT`

Retrieve or update all metadata for a single tag, such as its background & foreground colors. 

### Miscellany

#### `/api/config/`

Supported verbs: `GET`

Retrieve the current server configuration variables necessary for rendering a dashboard, such as `GRAPHITE_URL`. 

#### `/api/preferences/`

Supported verbs: `GET`, `PUT`

Retrieve or update the current user preferences. 

## JSON Data Format

### Dashboard

### Dashboard Items

All dashboard items share a common structure. Each is a JSON dictionary with an `item_type` attribute indicating what type of dashboard item it is. Item types generally fall into two categories - _structural_ elements, which control dashboard layout, and _presentations_, which create some visible output in the rendered dashboard. 


**Structural Item Types**

* `dashboard_definition`
* `section`
* `row`
* `cell`

**Presentation Types**

These item types have a visual component, but do not consume data from queries. 

* `heading`
* `separator`
* `markdown`

**Data Presentation Types**

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

