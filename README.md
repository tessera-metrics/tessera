# Tessera

Tessera is a front-end interface for Graphite, which provides a large selection of presentations, layout, and interactivity options for building dashboards.

The biggest key differences between Tessera and other frontends are the separation of queries from presentations, and the ability to apply arbitrary transformations to the presentations & queries, allowing for a large degree of interactivity. Tessera is initially focused on information presentation - it does not NOT address the areas of metric discovery or query composition (although it may in the future).

## Overview

Tessera consists of a small python webserver written with Flask with a SQL backing store. The server manages storing and searching for dashboards, managing tags for organization, serving the basic UI assets, and providing a ReST API for the front-end to use.

Dashboards are big lumps of JSON data describing the queries, presentations, and layout, wrapped in a small shell of SQL metadata. Most of the heavy lifting is done by the javascript front-end, which is responsible for all rendering, data fetching from graphite, and editing of dashboards.

## Documentation

Documentation is hosted on GitHub Pages at
[urbanairship.github.io/tessera/docs](http://urbanairship.github.io/tessera/docs/).

* [Getting Started](http://urbanairship.github.io/tessera/docs/) for getting started and running from source and importing the demo dashboards.
* [Tutorial](http://urbanairship.github.io/tessera/docs/guides/tutorial/) for creating the most basic possible
  dashboard.
* API [endpoints](http://urbanairship.github.io/tessera/docs/api/endpoints/) and [data format](http://urbanairship.github.io/tessera/docs/api/data-format/) for accessing Tessera via the HTTP REST API
* [Extending Tessera](http://urbanairship.github.io/tessera/docs/development/extension/), for adding new dashboard
  items, transformations, and actions.

Some additional writeup of why Tessera exists can found on the UA blog - [Introducing Tessera, a Graphite Frontend](http://urbanairship.com/blog/2014/06/30/introducing-tessera-a-graphite-frontend).

![screenshot](docs/screenshots/color-themes-small.png)

## Copyright & License

Copyright &copy; 2014, Urban Airship and Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

* [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Third-party software libraries included with this project are
distributed under their respective licenses.
