# -*- mode:python -*-

import flask
import json
import logging
import copy
from datetime import datetime
import inflection
import pybars
import urllib

from flask import render_template, request, redirect, jsonify, abort, session
from cask import Entity
import cask

from .model import *
from .model import database
from .application import app
from .application import db

mgr = database.DatabaseManager(db)
compiler = pybars.Compiler()
log = logging.getLogger(__name__)

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

def _jsonify(data):
    return flask.Response(status=200,
                          mimetype="application/json",
                          response=json.dumps(data, cls=EntityEncoder))

def _get_param(name, default=None, store_in_session=False):
    value = request.args.get(name) or session.get(name, default)
    if store_in_session:
        session[name] = value
    return value

# =============================================================================
#
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
#
# =============================================================================

@app.route('/api/dashboard/')
def api_dashboard_list():
    """Listing for all dashboards. Returns just the metadata, not the
    definitions.

    """
    return _jsonify({
        'dashboards' : [d.to_json() for d in database.Dashboard.query.all()]
    })

@app.route('/api/dashboard/tagged/<tag>')
def api_dashboard_list_tagged(tag):
    """Listing for a set of dashboards with a tag applied. Returns just
    the metadata, not the definitions.

    """
    return _jsonify({
        'dashboards' : [d.to_json() for d in database.Tag.query.filter_by(name=tag).first().dashboards]
    })


@app.route('/api/dashboard/<id>')
def api_dashboard_get(id):
    """Get the metadata for a single dashboard.

    """
    return _jsonify({
        'dashboards' : [database.Dashboard.query.get_or_404(id).to_json()]
    })

@app.route('/api/dashboard/', methods=['POST'])
def api_dashboard_create():
    """Create a new dashboard with an empty definition.

    """
    body = json.loads(request.data)
    dashboard = database.Dashboard.from_json(body)
    dashboard.definition = database.DashboardDef(dumps(DashboardDefinition()))
    mgr.store_dashboard(dashboard)
    return _jsonify({ 'ok' : True })

@app.route('/api/dashboard/<id>', methods=['PUT'])
def api_dashboard_update(id):
    """Update the metadata for an existing dashboard.

    """
    body = json.loads(request.data)
    dashboard = database.Dashboard.query.get_or_404(id)
    dashboard.merge_from_json(body)
    mgr.store_dashboard(dashboard)
    return _jsonify({ 'ok' : True })

@app.route('/api/dashboard/<id>', methods=['DELETE'])
def api_dashboard_delete(id):
    """Delete a dashboard. Use with caution.

    """
    dashboard = database.Dashboard.query.get_or_404(id)
    db.session.delete(dashboard)
    db.session.commit()
    # TODO - return 204 status
    return _jsonify({ 'ok' : True })

@app.route('/api/dashboard/<id>/definition')
def api_dashboard_get_definition(id):
    """Fetch the definition for a dashboard. This returns the
    representation to use when modifiying a dashboard.

    """
    dashboard = database.Dashboard.query.filter_by(id=id)[0]
    return _jsonify({
        'definition' : database.Dashboard.query.get_or_404(id).definition.to_json()
    })

@app.route('/api/dashboard/<id>/definition', methods=['PUT'])
def api_dashboard_update_definition(id):
    """Update the definition of the dashboard. This should use the
    representation returned by /api/dashboard/<id>/definition, and
    should NOT have any embedded variables expanded, nor should it
    have complete graphite URLs in the queries.

    """
    dashboard = database.Dashboard.query.get_or_404(id)

    # Validate the payload
    definition = DashboardDefinition.from_json(json.loads(request.data))

    if dashboard.definition:
        dashboard.definition.definition = dumps(definition)
    else:
        dashboard.definition = database.DashboardDef(request.data)

    mgr.store_dashboard(dashboard)

    return _jsonify({ 'ok' : True })

@app.route('/api/dashboard/<id>/definition/expanded')
def api_dashboard_get_expanded(id):
    """Fetch the complete definition of a dashboard and its metadata in a
    single object, with all graphite URLs expanded and any template
    variables filled in from the request parameters.

    The result of this API is suitable for rendering by the front-end
    library.
    """
    dash       = database.Dashboard.query.get_or_404(id)
    definition = dash.definition.to_json()
    from_time  = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)
    variables  = _get_template_variables(request.args)

    # Make a copy of the query map with all targets rendered to full
    # graphite URLs
    for k, v in definition['queries'].iteritems():
        params = [('format', 'json'), ('from', from_time)]
        if until_time:
            params.append(('until', until_time))
        if isinstance(v, basestring):
            v = [v]
        for target in v:
            target = _render_pybars_template(target, variables)
            params.append(('target', target))
        query = '{0}/render?{1}'.format(app.config['GRAPHITE_URL'], urllib.urlencode(params))
        definition['queries'][k] = query

    dash.title = _render_pybars_template(dash.title, variables)
    dash.description = _render_pybars_template(dash.description, variables)

    return _jsonify({
        'dashboard' : dash,
        'definition' : definition
    })

# =============================================================================
# Tags API
# =============================================================================

@app.route('/api/tag/')
def api_tag_list():
    """Listing for all tags.

    """
    sql = 'SELECT tag.id, tag.name, tag.description, count(*)' \
    + ' FROM dashboard_tags' \
    + ' INNER JOIN tag' \
    + ' ON dashboard_tags.tag_id = tag.id' \
    + ' GROUP BY tag.id'

    tags = []
    for row in db.engine.execute(sql):
        tag = database.Tag(name=row[1], description=row[2], count=row[3])
        tag.id = row[0]
        tags.append(tag)

    return _jsonify({
        'tags' : tags
    })


@app.route('/api/dashboard/<id>/tags', methods=['PUT'])
def api_dashboard_update_tags(id):
    """Update the tags for a dashboard.

    """
    dashboard = database.Dashboard.query.get_or_404(id)

    data = json.loads(request.data)
    tags = [Tag.from_json(t) for t in data['tags']]

    dashboard.tags = tags
    mgr.store_dashboard(dashboard)

    return _jsonify({ 'ok' : True })


# @app.route('/api/dashboard/<name>', methods=['POST'])
# def api_dashboard_instance_post(name):
#     """Workaround for the fact that XmlHttpRequest and form posting
#     *still* doesn't support anything other than GET and POST."""
#     if '_method' in request.args and request.args['_method'] == 'delete':
#         return api_dashboard_delete(name)
#     else:
#         return api_dashboard_put(name)

# =============================================================================
# UI Helpers
# =============================================================================

class RenderContext:
    def __init__(self):
        self.now = datetime.now()
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
                            definition=dashboard.definition,
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

@app.route('/dashboards/')
def ui_dashboard_list():
    return _render_template('dashboard-list.html',
                            title='Dashboards',
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '')])

@app.route('/dashboards/tagged/<tag>')
def ui_dashboard_list_tagged(tag):
    return _render_template('dashboard-list.html',
                            tag=tag,
                            title='Dashboards',
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '')])


@app.route('/dashboards/<id>')
def ui_dashboard(id):
    dashboard = database.Dashboard.query.get_or_404(id)
    return _render_client_side_dashboard(dashboard)
