---
layout: docs
title: Getting Started
category: Documentation
doc_section: General
---

In order to get this project running from source, you will need to
have Python 2.7, node.js, and a C compiler installed. node.js is used
for building the web assets, but is not used for running the server.

### Setting up the Python Environment

{% highlight bash %}
git clone git@github.com:urbanairship/tessera.git
cd tessera
virtualenv .
. bin/activate

# If you are on a Mac and have XCode 5.1 installed, you'll need this
# set before installing the dependencies from requirements.txt for
# SQLAlchemy's C extensions to compile.
export ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future

# Install dependencies
pip install -r requirements.txt
pip install -r dev-requirements.txt
{% endhighlight %}

### Setting up the Javascript Environment

Javascript code is bundled using [Grunt](http://gruntjs.com/). To set
up grunt and generate the bundled .js files that the web app loads:

{% highlight bash %}
npm install -g grunt-cli
npm install
grunt
{% endhighlight %}

If you're going to edit the javascript, .css, or .hbs files and wish
to automatically regenerate the bundled files as they're edited, run

{% highlight bash %}
grunt watch &
{% endhighlight %}

### Create the database

Tessera is configured by default to run off of a sqlite backing
store, which has to be initialized, and can be populated with a bunch
of demo dashboards. To initialize the database and generate the demo
dashboards:

{% highlight bash %}
inv initdb
inv json.import 'demo/*'
{% endhighlight %}

### Configure

Tessera provides a short but flexible configuration hierarchy:

* Application defaults are stored in `tessera/config.py`
* If a file `etc/config.py` exists, relative to the app process' working
  directory, it will be loaded next, overriding settings from the above
  defaults file.
* If the environment variable `TESSERA_CONFIG` is set, the file it points to
  will be loaded last, overriding settings from either of the above two.

The settings you will most likely need to change from the get-go are:

* `SQLALCHEMY_DATABASE_URI`: A [database URI
  string](http://docs.sqlalchemy.org/en/rel_0_9/core/engines.html#database-urls)
  telling SQLAlchemy where to find your database, e.g. `sqlite:///tessera.db`
  to load a file relative to the Tessera app code,
  `sqlite:////var/data/tessera/app.db` to load a DB from a systemwide
  `/var/data/` hierarchy, or `postgresql://localhost/tessera` to load the
  `tessera` Postgres db from a local default Postgres install.
* `GRAPHITE_URL`: The URL to your Graphite webapp, e.g.
  `http://graphite.example.com/`.
* `SECRET_KEY`: Key used to secure sessions.

### Run

In development environments, running Tessera is as simple as:

{% highlight bash %}
# Run it (defaults to http://localhost:5000)
inv run
{% endhighlight %}

In production we recommend using [gunicorn](http://gunicorn.org/) or your WSGI
server of choice, e.g.:

{% highlight bash %}
gunicorn [gunicorn opts here] tessera:app
{% endhighlight %}

### Importing Dashboards from Graphite-Web

Importing dashboard definitions from the built-in dashboard system in
graphite-web is currently supported, via the command
**import_graphite_dashboards**, which supports four optional
arguments **query**, **layout**, and **columns**, and **overwrite**.

By default, the importer will skip any dashboards that have already
been imported, as determined by the original dashboard URL in
``Dashboard.imported_from``. To re-import a dashboard, overwriting the
definition, supply ``--overwrite`` on the command line.

To import everything with default settings, which will create a 4
column fluid layout:

{% highlight bash %}
$ inv graphite.import
{% endhighlight %}

You can import a subset of dashboards with the ``--query`` parameter.

{% highlight bash %}
$ inv graphite.import --query=hbase
{% endhighlight %}

The importer also allows specify the basic layout type (``fluid`` or
``fixed``), and the number of columns.

{% highlight bash %}
$ inv graphite.import --query=api --layout=fixed --columns=1
{% endhighlight %}
