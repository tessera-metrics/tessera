# -*- mode:python -*-

import flask
import json
import logging
import copy
import datetime
import inflection
import pystache
import urllib

from flask import Flask, render_template, request, redirect, jsonify, abort, session
from cask import Entity

import toolbox
from .model import *

# =============================================================================
# Setup
# =============================================================================

log = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = 'e688f6cb-fc11-65fa-c091-aba197c56c66'

mgr = cask.web.WebManagerAdapter(DashboardManager(app.config['DASHBOARD_DATADIR']))
env = toolbox.CLUSTO.environment(app.config['ENVIRONMENT_NAME'])

# =============================================================================
# API Helpers
# =============================================================================

def _get_server_names(query_params):
    servers = {}

    for query_param in query_params:
        key, value = query_param
        if key == 'p[node]':
            servers['node'] = value

    return servers

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
    elif isinstance(entities, Entity):
        return { 'entities' : [_to_json(entities)] }

def _to_json_names(names):
    return { 'names' : names }

def _jsonify(data):
    return flask.Response(status=200,
                          mimetype="application/json",
                          response=cask.dumps(data))

def _get_param(name, default=None, store_in_session=False):
    value = request.args.get(name) or session.get(name, default)
    if store_in_session:
        session[name] = value
    return value

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

@app.route('/api/dashboard/listing')
def api_dashboard_listing():
    """Return a JSON array of partial dashboard objects, for rendering a
    directory."""
    return _jsonify(_to_json_names(mgr.list(Dashboard)))

@app.route('/api/dashboard/<name>')
def api_dashboard_get(name):
    """Fetch a single Dashboard entity, or 404 if it is not found."""
    return _jsonify(_to_json_entities(mgr.load(Dashboard, name)))

@app.route('/api/dashboard/<name>/expanded')
def api_dashboard_get_expanded(name):
    """Fetch a single Dashboard entity, or 404 if it is not found. This
    version expands graphite queries for client-side rendering.
    """
    dash       = mgr.load(Dashboard, name)
    from_time  = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)

    query_params = request.args.items()

    servers = _get_server_names(query_params)

    # Make a copy of the query map with all targets rendered to full
    # graphite URLs
    queries = {}
    for k, v in dash.queries.iteritems():
        params = [('format', 'json'), ('from', from_time)]
        if until_time:
            params.append(('until', until_time))
        if isinstance(v, list):
            for target in v:
                target = pystache.render(target, servers)
                params.append(('target', target))
        else:
            v = pystache.render(v, servers)
            params.append(('target', v))
        query = '{0}/render?{1}'.format(app.config['GRAPHITE_URL'], urllib.urlencode(params))
        queries[k] = query

    # Make a shallow copy of the dashboard with the queries member
    # replaced with the expanded version
    dashboard = copy.copy(dash)
    dashboard.queries = queries

    return _jsonify(_to_json_entities(dashboard))

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
# UI Helpers
# =============================================================================

class RenderContext:
    def __init__(self):
        self.now = datetime.datetime.now()
        self.element_index = 0

    def get(self, key, default=None, store_in_session=False):
        return _get_param(key, default=default, store_in_session=store_in_session)

def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_client_side_dashboard(dashboard, template='dashboard.html'):
    from_time = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)

    query_params = request.args.items()

    servers = _get_server_names(query_params)

    dashboard.title = pystache.render(dashboard.title, servers)

    extra_params = request.args.to_dict()

    title = '{0} {1}'.format(dashboard.category, dashboard.title)
    return _render_template(template,
                            dashboard=dashboard,
                            from_time=from_time,
                            extra_params=urllib.urlencode(extra_params),
                            until_time=until_time,
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/dashboards'),
                                         (title, '')])


# =============================================================================
# UI: Basics
# =============================================================================

@app.route('/')
def ui_root():
    return _render_template('index.html', breadcrumbs=[('Home', '/')])

@app.route('/dashboards')
def ui_dashboard_list():
    data = _get_entities(Dashboard)
    return _render_template('dashboard-list.html',
                            dashboards=data,
                            title='Dashboards',
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '')])

@app.route('/dashboards/<name>')
def ui_dashboard(name):
    return _render_client_side_dashboard(mgr.load(Dashboard, name))
