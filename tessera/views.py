# -*- mode:python -*-

import flask
import json
import logging
from datetime import datetime
import inflection

from flask import render_template, request, session
from werkzeug.exceptions import HTTPException

from tessera_client.api.model import *
from . import database
from .application import app
from .application import db
from ._version import __version__

mgr = database.DatabaseManager(db)
log = logging.getLogger(__name__)

# =============================================================================
# API Helpers
# =============================================================================

def _uri(path):
    root = app.config['APPLICATION_ROOT']
    if root:
        return root + path
    return path

def _jsonify(data, status=200, headers=None):
    response = flask.Response(status=status,
                              mimetype="application/json",
                              response=json.dumps(data, cls=EntityEncoder, sort_keys=True))
    if isinstance(headers, dict):
        for key, value in headers.items():
            response.headers[key] = str(value)
    return response

def _set_exception_response(http_exception):
    http_exception.response = _jsonify({
        'error_message' : http_exception.description
    }, status=http_exception.code)
    return http_exception

def _get_param(name, default=None, store_in_session=False):
    """Retrieve a named parameter from the request, falling back to the
session. If store_in_session is True, the value will be stored in the
session.
    """
    value = request.args.get(name) or session.get(name, default)
    if store_in_session:
        session[name] = value
    return value

def _get_param_boolean(name, default=None):
    value = _get_param(name, default)
    return value == 'True' \
        or value == 'true'

def _get_config():
    """Retrieve a dictionary containing all UI-relevant config settings."""
    return {
        'GRAPHITE_URL' : app.config['GRAPHITE_URL'],
        'DISPLAY_TIMEZONE' : app.config.get('DISPLAY_TIMEZONE', 'UTC'),
        'DEFAULT_FROM_TIME' : app.config['DEFAULT_FROM_TIME']
    }

def _get_preferences(store_in_session=False):
    """Retrieve a dictionary containing all user preferences, obtained
from (in order) the request parameters, session, and config
defaults.
    """
    return {
        'interactive' : _get_param('interactive', app.config['INTERACTIVE_CHARTS_DEFAULT'], store_in_session=store_in_session) == 'true',
        'theme' : _get_param('theme', app.config['DEFAULT_THEME'], store_in_session=store_in_session),
        'renderer' : _get_param('renderer', app.config['INTERACTIVE_CHARTS_RENDERER'], store_in_session=store_in_session),
        'refresh' : _get_param('refresh', app.config['DEFAULT_REFRESH_INTERVAL'], store_in_session=store_in_session),
        'timezone' : _get_param('timezone', app.config['DISPLAY_TIMEZONE'], store_in_session=store_in_session),
        'graphite_url' : _get_param('graphite_url', app.config['GRAPHITE_URL'], store_in_session=store_in_session)
    }

def _set_preferences(prefs):
    """Store multiple key/value pairs in the session."""
    for name, value in prefs.items():
        session[name] = value

def _dashboard_sort_column():
    """Return a SQLAlchemy column descriptor to sort results by, based on
the 'sort' and 'order' request parameters.
    """
    columns = {
        'created' : database.DashboardRecord.creation_date,
        'modified' : database.DashboardRecord.last_modified_date,
        'category' : database.DashboardRecord.category,
        'id' : database.DashboardRecord.id,
        'title' : database.DashboardRecord.title
    }
    colname = _get_param('sort', 'created')
    order   = _get_param('order')
    column  = database.DashboardRecord.creation_date
    if colname in columns:
        column = columns[colname]

    if order == 'desc' or order == u'desc':
        return column.desc()
    else:
        return column.asc()

def _set_dashboard_hrefs(dash):
    """Add the various ReSTful hrefs to an outgoing dashboard
representation. dash should be the dictionary for of the dashboard,
not the model object.
    """
    id = dash['id']
    dash['href'] = _uri('/api/dashboard/{0}'.format(id))
    dash['definition_href'] = _uri('/api/dashboard/{0}/definition'.format(id))
    dash['view_href'] = _uri('/dashboards/{0}/{1}'.format(id, inflection.parameterize(dash['title'])))
    if 'definition' in dash:
        definition = dash['definition']
        definition['href'] = _uri('/api/dashboard/{0}/definition'.format(id))
    return dash

def _dashboards_response(dashboards):
    """Return a Flask response object for a list of dashboards in API
format. dashboards must be a list of dashboard model objects, which
will be converted to their JSON representation.
    """
    if not isinstance(dashboards, list):
        dashboards = [dashboards]

    include_definition = _get_param_boolean('definition', False)
    return _jsonify([ _set_dashboard_hrefs(d.to_json(include_definition=include_definition)) for d in dashboards])

def _set_tag_hrefs(tag):
    """Add ReSTful href attributes to a tag's dictionary
representation.
    """
    id = tag['id']
    tag['href'] = _uri('/api/tag/{0}'.format(id))
    return tag

def _tags_response(tags):
    """Return a Flask response object for a list of tags in API
format. tags must be a list of tag model objects, which
will be converted to their JSON representation.
"""
    if not isinstance(tags, list):
        tags = [tags]
    return _jsonify([_set_tag_hrefs(t.to_json()) for t in tags])

# =============================================================================
# API Endpoints
# =============================================================================

#
# Dashboards
#

@app.route('/api/dashboard/')
def api_dashboard_list():
    """Listing for all dashboards. Returns just the metadata, not the
    definitions.

    """
    imported_from = request.args.get('imported_from')
    if imported_from:
        query = database.DashboardRecord.query.filter_by(imported_from=imported_from) \
                                              .order_by(_dashboard_sort_column())
    else:
        query = database.DashboardRecord.query.order_by(_dashboard_sort_column())
    dashboards = [d for d in query.all()]
    return _dashboards_response(dashboards)

@app.route('/api/dashboard/tagged/<tag>')
def api_dashboard_list_tagged(tag):
    """Listing for a set of dashboards with a tag applied. Returns just
    the metadata, not the definitions.

    """
    tag = database.TagRecord.query.filter_by(name=tag).first()
    if not tag:
        return _dashboards_response([])
    dashboards = [d for d in tag.dashboards.order_by(_dashboard_sort_column()) if tag]
    return _dashboards_response(dashboards)

@app.route('/api/dashboard/category/<category>')
def api_dashboard_list_dashboards_in_category(category):
    """Listing for a set of dashboards in a specified category. Returns
    just the metadata, not the definitions.

    """
    dashboards = [d for d in database.DashboardRecord.query
                  .filter_by(category=category)
                  .order_by(_dashboard_sort_column()) ]
    return _dashboards_response(dashboards)


@app.route('/api/dashboard/category/')
def api_dashboard_list_all_dashboard_categories():
    result = db.session.query(
        database.DashboardRecord.category,
        db.func.count(database.DashboardRecord.category)
    ).group_by(database.DashboardRecord.category).all()
    categories = []
    for (name, count) in result:
        categories.append({
            'name' : name,
            'count' : count,
        })
    return _jsonify(categories)

@app.route('/api/dashboard/<id>')
def api_dashboard_get(id):
    """Get the metadata for a single dashboard.

    """
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    rendering = _get_param('rendering', False)
    include_definition = _get_param_boolean('definition', False)
    dash = _set_dashboard_hrefs(dashboard.to_json(rendering or include_definition))
    if rendering:
        dash['preferences'] = _get_preferences()
    return _jsonify(dash)

@app.route('/api/dashboard/', methods=['POST'])
def api_dashboard_create():
    """Create a new dashboard with an empty definition.

    """
    dashboard = database.DashboardRecord.from_json(request.json)
    if 'definition' in request.json:
        dashboard.definition = database.DefinitionRecord(dumps(request.json['definition']))
    else:
        dashboard.definition = database.DefinitionRecord(dumps(DashboardDefinition()))
    mgr.store_dashboard(dashboard)
    href = _uri('/api/dashboard/{0}'.format(dashboard.id))
    return _jsonify({
        'dashboard_href' : href,
        # TODO: should use normalized method for this
        'view_href' : '/dashboards/{0}/{1}'.format(dashboard.id, inflection.parameterize(dashboard.title))
    }, status=201, headers = { 'Location' : href })

@app.route('/api/dashboard/<id>', methods=['PUT'])
def api_dashboard_update(id):
    """Update the metadata for an existing dashboard.

    """
    body = json.loads(request.data)
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    dashboard.merge_from_json(body)
    mgr.store_dashboard(dashboard)
    # TODO - return similar to create, above
    return _jsonify({})

@app.route('/api/dashboard/<id>', methods=['DELETE'])
def api_dashboard_delete(id):
    """Delete a dashboard. Use with caution.

    """
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    db.session.delete(dashboard)
    db.session.commit()
    return _jsonify({},
                    status=204)

@app.route('/api/dashboard/<id>/definition')
def api_dashboard_get_definition(id):
    """Fetch the definition for a dashboard. This returns the
    representation to use when modifiying a dashboard.

    """
    dashboard = database.DashboardRecord.query.filter_by(id=id)[0]
    try:
        definition = database.DashboardRecord.query.get_or_404(id).definition.to_json()
    except HTTPException as e:
        raise _set_exception_response(e)
    definition['href'] = _uri('/api/dashboard/{0}/definition'.format(id))
    definition['dashboard_href'] = _uri('/api/dashboard/{0}'.format(id))
    return _jsonify(definition)

@app.route('/api/dashboard/<id>/definition', methods=['PUT'])
def api_dashboard_update_definition(id):
    """Update the definition of the dashboard. This should use the
    representation returned by /api/dashboard/<id>/definition, and
    should NOT have any embedded variables expanded, nor should it
    have complete graphite URLs in the queries.

    """
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)

    # Validate the payload
    definition = DashboardDefinition.from_json(json.loads(request.data.decode('utf-8')))

    if dashboard.definition:
        dashboard.definition.definition = dumps(definition)
    else:
        dashboard.definition = database.DashboardRecordDef(request.data)

    mgr.store_dashboard(dashboard)

    return _jsonify({})

#
# Tags
#

@app.route('/api/tag/')
def api_tag_list():
    """Listing for all tags.

    """
    tags = db.session.query(database.TagRecord).all()
    return _tags_response(tags)

@app.route('/api/tag/<id>')
def api_tag_get(id):
    try:
        tag = database.TagRecord.query.get_or_404(id)
        return _tags_response(tag)
    except HTTPException as e:
        raise _set_exception_response(e)


#
# Miscellany
#

@app.route('/api/config')
def api_config_get():
    return _jsonify(_get_config())

@app.route('/api/preferences/')
def api_preferences_get():
    return _jsonify(_get_preferences())

@app.route('/api/preferences/', methods=['PUT'])
def api_preferences_put():
    _set_preferences(request.json)
    return _jsonify(_get_preferences())

# =============================================================================
# UI
# =============================================================================

#
# Helpers
#

class RenderContext:
    def __init__(self):
        self.now = datetime.now()
        self.prefs = _get_preferences()
        self.version = __version__

    def get(self, key, default=None, store_in_session=False):
        return _get_param(key, default=default, store_in_session=store_in_session)

    def get_int(self, key, default=None, store_in_session=False):
        return int(self.get(key, default=default, store_in_session=store_in_session))

    def get_str(self, key, default=None, store_in_session=False):
        return str(self.get(key, default=default, store_in_session=store_in_session))


def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_client_side_dashboard(dashboard, template='dashboard.html', transform=None):
    from_time = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)
    title = '{0} {1}'.format(dashboard.category, dashboard.title)
    return _render_template(template,
                            dashboard=dashboard,
                            definition=dashboard.definition,
                            from_time=from_time,
                            until_time=until_time,
                            title=title,
                            transform=transform,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/dashboards'),
                                         (title, '')])

#
# Endpoints
#

@app.route('/')
def ui_root():
    return _render_template('index.html', breadcrumbs=[('Home', '/')])

@app.route('/preferences/')
def ui_preferences():
    _get_preferences(store_in_session=True),
    title = 'User Preferences'
    return _render_template('preferences.html',
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         (title, '')])

@app.route('/dashboards/')
def ui_dashboard_list():
    title = 'Dashboards'
    return _render_template('dashboard-list.html',
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         (title, '')])

@app.route('/dashboards/create/')
def ui_dashboard_create():
    title = 'New Dashboard'
    return _render_template('dashboard-create.html',
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/dashboards'),
                                         (title, '')])


@app.route('/dashboards/tagged/<tag>')
def ui_dashboard_list_tagged(tag):
    title = 'Dashboards'
    return _render_template('dashboard-list.html',
                            tag=tag,
                            title=title,
                            breadcrumbs=[('Home', '/'),
                                         (title, '')])


@app.route('/dashboards/<id>/<slug>', defaults={'path' : ''})
@app.route('/dashboards/<id>/<slug>/<path:path>')
def ui_dashboard_with_slug(id, slug, path):
    return ui_dashboard(id, slug, path)

@app.route('/dashboards/<id>/')
def ui_dashboard(id, slug=None, path=None):
    transform = None
    if path and path.find('transform') > -1:
        element, ignore, name = path.split('/')
        transform = {
            'element': element,
            'name' : name
        }
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
        return _render_client_side_dashboard(dashboard, transform=transform)
    except HTTPException as e:
        raise _set_exception_response(e)
