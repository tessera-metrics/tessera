# -*- mode:python -*-

import flask
import json
import logging
import copy
import datetime
import inflection
import pybars
import urllib

from flask import render_template, request, redirect, jsonify, abort, session
from cask import Entity
import cask

from .model import *
from .model import database
from .application import app

mgr = cask.web.WebManagerAdapter(DashboardManager(app.config['DASHBOARD_DATADIR']))
compiler = pybars.Compiler()

# =============================================================================
# API Helpers
# =============================================================================

def _get_template_variables(query_params):
    variables = {}
    for key, value in query_params.items():
        if key.startswith('p[') and key.endswith(']'):
            variable_name = key[2:-1]
            variables[key[2:-1]] = value
    return variables

def _render_pybars_template(template, variables):
    compiled = compiler.compile(unicode(template))
    output = compiled(variables)
    return ''.join(output)

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
    return _jsonify(_to_json_entities(_get_entities(DashboardDefinition)))

@app.route('/api/dashboard/<name>')
def api_dashboard_get(name):
    """Fetch a single Dashboard entity, or 404 if it is not found."""
    return _jsonify(_to_json_entities(mgr.load(DashboardDefinition, name)))


# ## API Endpoints
#
# ``/api/dashboard`` (GET, POST)
#
#   List all dashboards, returning their basic metadata (replaces the
#   /names and /listing endpoints)
#
# ``/api/dashboard/<id>`` (GET, POST, PUT, DELETE)
#
#  Manage the metadata for a single dashboard.
#
# ``/api/dashboard/<id>/definition`` (GET, PUT)
#
#   Manage the complete definition of a single dashboard
#
# ``/api/dashboard/<id>/definition/expanded`` (GET)
#
#   Get the complete definition of a single dashboard with all URLs
#   and template variables expanded, ready for rendering.
#
# ``/api/dashboard/<id>/tags`` (GET, PUT)
#
#   Manage the tags sub-set of the dashboard's metadata.
#
# ``/api/tags`` (GET)
#
#  Get a list of all tags, for populating auto-complete widgets.

@app.route('/api/dashboard/<id>/tags')
def api_dashboard_get_tags(id):
    pass

@app.route('/api/dashboard/<id>/tags', methods=['PUT'])
def api_dashboard_set_tags(id):
    pass

@app.route('/api/dashboard/<id>/definition')
def api_dashboard_get_definition(id):
    pass

@app.route('/api/dashboard/<id>/definition/expanded')
def api_dashboard_get_definition_expanded(id):
    pass

@app.route('/api/dashboard/<id>/definition', methods=['PUT'])
def api_dashboard_set_definition(id):
    pass

@app.route('/api/tags')
def api_get_tags(id):
    pass



@app.route('/api/dashboard/<name>/expanded')
def api_dashboard_get_expanded(name):
    """Fetch a single Dashboard entity, or 404 if it is not found. This
    version expands graphite queries for client-side rendering.
    """
    dash       = mgr.load(DashboardDefinition, name)
    from_time  = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)

    template_variables = _get_template_variables(request.args)

    # Make a copy of the query map with all targets rendered to full
    # graphite URLs
    queries = {}
    for k, v in dash.queries.iteritems():
        params = [('format', 'json'), ('from', from_time)]
        if until_time:
            params.append(('until', until_time))
        if isinstance(v, basestring):
            v = [v]
        for target in v:
            target = _render_pybars_template(target, template_variables)
            params.append(('target', target))
        query = '{0}/render?{1}'.format(app.config['GRAPHITE_URL'], urllib.urlencode(params))
        queries[k] = query

    # Make a shallow copy of the dashboard with the queries member
    # replaced with the expanded version
    dashboard = copy.copy(dash)
    dashboard.queries = queries
    dashboard.title = _render_pybars_template(dash.title, template_variables)
    dashboard.description = _render_pybars_template(dash.description, template_variables)

    return _jsonify(_to_json_entities(dashboard))

@app.route('/api/dashboard', methods=['POST'])
def api_dashboard_post():
    """Create a new Dashboard entity."""
    data = json.loads(request.data)
    if mgr.exists(data['name']):
        abort(409)
    e = DashboardDefinition.from_json(data, mgr)
    mgr.store(DashboardDefinition, e)
    # TODO - return 201 Created here
    return api_dashboard_get(e.name)

@app.route('/api/dashboard/<name>', methods=['PUT', 'PATCH'])
def api_dashboard_put(name):
    """Update an existing Dashboard entity."""
    e = mgr.load(DashboardDefinition, name)
    data = json.loads(request.data)
    for key, value in data.items():
        if key == u'id':
            continue
        setattr(e, str(key), value)
    mgr.store(DashboardDefinition, e)
    return api_dashboard_get(e.name)

@app.route('/api/dashboard/<name>', methods=['DELETE'])
def api_dashboard_delete(name):
    """Delete an existing Dashboard entity."""
    mgr.remove(DashboardDefinition, name)
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

    template_variables = _get_template_variables(request.args)

    dashboard.title = _render_pybars_template(dashboard.title, template_variables)
    dashboard.description = _render_pybars_template(dashboard.description, template_variables)

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
    data = _get_entities(DashboardDefinition)
    return _render_template('dashboard-list.html',
                            dashboards=data,
                            title='Dashboards',
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '')])

@app.route('/dashboards/<name>')
def ui_dashboard(name):
    return _render_client_side_dashboard(mgr.load(DashboardDefinition, name))
