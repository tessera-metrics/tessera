# -*- mode:python -*-

import flask
import json
import sys
import copy
import datetime
import time
import os.path
import inflection

from flask import Flask, render_template, request, redirect, jsonify, abort
from cask import Entity

import toolbox
from toolbox.graphite import Graphite, GraphiteQuery
from .demo import demo_dashboard, gbc_demo_dashboard
from .model import *

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)
app.config.from_pyfile('config.py')

mgr = cask.web.WebManagerAdapter(DashboardManager(app.config['DASHBOARD_DATADIR']))
env = toolbox.CLUSTO.environment(app.config['ENVIRONMENT_NAME'])
graphite = env.graphite()

# =============================================================================
# Template Helpers
# =============================================================================

class RenderContext:
    def __init__(self):
        self.now = datetime.datetime.now()
        self.element_index = 0

def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_dashboard(dash):
    from_time = request.args.get('from', app.config['DEFAULT_FROM_TIME'])
    until_time = request.args.get('until', None)

    # Make a copy of the query map with all targets rendered to full
    # graphite URLs
    queries = {}
    for k, v in dash.queries.iteritems():
        query = GraphiteQuery(v, format=Graphite.Format.JSON, from_time=from_time, until_time=until_time)
        queries[k] = str(graphite.render_url(query))

    # Make a shallow copy of the dashboard with the queries member
    # replaced with the expanded version
    dashboard = copy.copy(dash)
    dashboard.queries = queries
    title = '{0} {1}'.format(dashboard.category, dashboard.title)
    return _render_template('dashboard.html',
                            dashboard=dashboard,
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/'),
                                         (title, '')])

# =============================================================================
# API Helpers
# =============================================================================

def _get_entities(cls):
    pattern = request.args.get('filter', '*')
    return mgr.load_all(cls, pattern=pattern)

def _to_json(entity):
    if not isinstance(entity, Entity):
        return entity
    json = entity.to_json()
#    json['uri'] = entity_uri(entity, 'api')
#    json['data_uri'] = entity_uri(entity, 'data')
#    json['interface_uri'] = entity_uri(entity, 'ui')
    return json

def _to_json_entities(entities):
    if isinstance(entities, list):
        return { 'entities' : [_to_json(e) for e in entities] }
    elif isinstance(entities, Model):
        return { 'entities' : [_to_json(entities)] }

def _to_json_names(names):
    return { 'names' : names }

def _jsonify(data):
    return flask.Response(status=200,
                          mimetype="application/json",
                          response=cask.dumps(data))

# =============================================================================
# API: Dashboard
# =============================================================================

@app.route('/api/dashboard')
def api_dashboard_list():
    """Fetch all Dashboard entities."""
    return _jsonify(_to_json_entities(_get_entities(Dashboard)))

@app.route('/api/dashboard/names')
def api_dashboard_names():
    """Return a JSON array of only the dashboard names, suitable for
    most javascript typeahead components."""
    return _jsonify(_to_json_names(mgr.list(Dashboard)))

@app.route('/api/dashboard/<name>')
def api_dashboard_get(name):
    """Fetch a single Dashboard entity, or 404 if it is not found."""
    return _jsonify(_to_json_entities(mgr.load(Dashboard, name)))

@app.route('/api/dashboard', methods=['POST'])
def api_dashboard_post():
    """Create a new Dashboard entity."""
    data = json.loads(request.data)
    if mgr.exists(data['name']):
        abort(409)
    e = Dashboard.from_json(data, mgr)
    mgr.store(Dashboard, e)
    # TODO - return 201 Created here
    return api_dashboard_get(e.name)

@app.route('/api/dashboard/<name>', methods=['PUT', 'PATCH'])
def api_dashboard_put(name):
    """Update an existing Dashboard entity."""
    e = mgr.load(Dashboard, name)
    data = json.loads(request.data)
    for key, value in data.items():
        if key == u'id':
            continue
        setattr(e, str(key), value)
    mgr.store(Dashboard, e)
    return api_dashboard_get(e.name)

@app.route('/api/dashboard/<name>', methods=['DELETE'])
def api_dashboard_delete(name):
    """Delete an existing Dashboard entity."""
    mgr.remove(Dashboard, name)
    return _jsonify({})

@app.route('/api/dashboard/<name>', methods=['POST'])
def api_dashboard_instance_post(name):
    """Workaround for the fact that XmlHttpRequest and form posting
    *still* doesn't support anything other than GET and POST."""
    if '_method' in request.args and request.args['_method'] == 'delete':
        return api_dashboard_delete(name)
    else:
        return api_dashboard_put(name)

# =============================================================================
# UI: Basics
# =============================================================================

@app.route('/')
def ui_root():
    return _render_template('index.html', breadcrumbs=[('Home', '/')])

@app.route('/demo/automation')
def ui_demo_automation():
    return _render_dashboard(demo_dashboard(env))

@app.route('/demo/gbc')
def ui_demo_gbc():
    return _render_dashboard(gbc_demo_dashboard())
