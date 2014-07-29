---
layout: docs
title: Endpoints
category: Documentation
doc_section: API
doc_title: API Endpoints
---

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
