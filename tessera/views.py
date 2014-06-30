# -*- mode:python -*-

import flask
import json
import logging
from datetime import datetime
import inflection

from flask import render_template, request, session
from werkzeug.exceptions import HTTPException

from .model import *
from .model import database
from .application import app
from .application import db
from ._version import __version__

mgr = database.DatabaseManager(db)
log = logging.getLogger(__name__)

# =============================================================================
# API Helpers
# =============================================================================

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
        'ok' : False,
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

def _get_config():
    """Retrieve a dictionary containing all UI-relevant config settings."""
    return {
        'GRAPHITE_URL' : app.config['GRAPHITE_URL'],
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
        'renderer' : _get_param('renderer', app.config['INTERACTIVE_CHARTS_RENDERER'], store_in_session=store_in_session)
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
        'created' : database.Dashboard.creation_date,
        'modified' : database.Dashboard.last_modified_date,
        'category' : database.Dashboard.category,
        'id' : database.Dashboard.id,
        'title' : database.Dashboard.title
    }
    colname = _get_param('sort', 'created')
    order   = _get_param('order')
    column  = database.Dashboard.creation_date
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
    dash['href'] = '/api/dashboard/{0}'.format(id)
    dash['definition_href'] = '/api/dashboard/{0}/definition'.format(id)
    dash['view_href'] = '/dashboards/{0}/{1}'.format(id, inflection.parameterize(dash['title']))
    if 'definition' in dash:
        definition = dash['definition']
        definition['href'] = '/api/dashboard/{0}/definition'.format(id)
    return dash

def _dashboards_response(dashboards):
    """Return a Flask response object for a list of dashboards in API
format. dashboards must be a list of dashboard model objects, which
will be converted to their JSON representation.
    """
    if not isinstance(dashboards, list):
        dashboards = [dashboards]
    return _jsonify({
        'ok' : True,
        'dashboards' : [ _set_dashboard_hrefs(d.to_json()) for d in dashboards]
    })

def _set_tag_hrefs(tag):
    """Add ReSTful href attributes to a tag's dictionary
representation.
    """
    id = tag['id']
    tag['href'] = '/api/tag/{0}'.format(id)
    return tag

def _tags_response(tags):
    """Return a Flask response object for a list of tags in API
format. tags must be a list of tag model objects, which
will be converted to their JSON representation.
"""
    if not isinstance(tags, list):
        tags = [tags]
    return _jsonify({
        'ok' : True,
        'tags' : [_set_tag_hrefs(t.to_json()) for t in tags]
    })

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
    dashboards = [d for d in database.Dashboard.query.order_by(_dashboard_sort_column()).all()]
    return _dashboards_response(dashboards)

@app.route('/api/dashboard/tagged/<tag>')
def api_dashboard_list_tagged(tag):
    """Listing for a set of dashboards with a tag applied. Returns just
    the metadata, not the definitions.

    """
    tag = database.Tag.query.filter_by(name=tag).first()
    if not tag:
        return _dashboards_response([])
    dashboards = [d for d in tag.dashboards.order_by(_dashboard_sort_column()) if tag]
    return _dashboards_response(dashboards)

@app.route('/api/dashboard/category/<category>')
def api_dashboard_list_dashboards_in_category(category):
    """Listing for a set of dashboards in a specified category. Returns
    just the metadata, not the definitions.

    """
    dashboards = [d for d in database.Dashboard.query
                  .filter_by(category=category)
                  .order_by(_dashboard_sort_column()) ]
    return _dashboards_response(dashboards)


@app.route('/api/dashboard/category/')
def api_dashboard_list_all_dashboard_categories():
    sql = 'SELECT category, count(category) FROM dashboard GROUP BY category'
    categories = []
    for row in db.engine.execute(sql):
        categories.append({
            'name' : row[0],
            'count' : row[1]
        })
    return _jsonify({
        'ok' : True,
        'categories' : categories
    })

@app.route('/api/dashboard/<id>')
def api_dashboard_get(id):
    """Get the metadata for a single dashboard.

    """
    try:
        dashboard = database.Dashboard.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    dash = _set_dashboard_hrefs(dashboard.to_json())
    response = {
        'ok' : True,
        'dashboards' : [dash]
    }
    rendering = _get_param('rendering', False)
    if rendering or _get_param('definition', False):
        dash['definition'] = json.loads(dashboard.definition.definition)
    if rendering:
        response['config'] = _get_config()
        response['preferences'] = _get_preferences()
    return _jsonify(response)

@app.route('/api/dashboard/', methods=['POST'])
def api_dashboard_create():
    """Create a new dashboard with an empty definition.

    """
    dashboard = database.Dashboard.from_json(request.json)
    if 'definition' in request.json:
        dashboard.definition = database.DashboardDef(dumps(request.json['definition']))
    else:
        dashboard.definition = database.DashboardDef(dumps(DashboardDefinition()))
    mgr.store_dashboard(dashboard)
    href = '/api/dashboard/{0}'.format(dashboard.id)
    return _jsonify({ 'ok' : True,
                      'dashboard_href' : href,
                      # TODO: should use normalized method for this
                      'view_href' : '/dashboards/{0}/{1}'.format(dashboard.id, inflection.parameterize(dashboard.title)) },
                    status=201,
                    headers = { 'Location' : href })

@app.route('/api/dashboard/<id>', methods=['PUT'])
def api_dashboard_update(id):
    """Update the metadata for an existing dashboard.

    """
    body = json.loads(request.data)
    try:
        dashboard = database.Dashboard.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    dashboard.merge_from_json(body)
    mgr.store_dashboard(dashboard)
    return _jsonify({ 'ok' : True })

@app.route('/api/dashboard/<id>', methods=['DELETE'])
def api_dashboard_delete(id):
    """Delete a dashboard. Use with caution.

    """
    try:
        dashboard = database.Dashboard.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)
    db.session.delete(dashboard)
    db.session.commit()
    return _jsonify({ 'ok' : True },
                    status=204)

@app.route('/api/dashboard/<id>/definition')
def api_dashboard_get_definition(id):
    """Fetch the definition for a dashboard. This returns the
    representation to use when modifiying a dashboard.

    """
    dashboard = database.Dashboard.query.filter_by(id=id)[0]
    try:
        definition = database.Dashboard.query.get_or_404(id).definition.to_json()
    except HTTPException as e:
        raise _set_exception_response(e)
    definition['href'] = '/api/dashboard/{0}/definition'.format(id)
    definition['dashboard_href'] = '/api/dashboard/{0}'.format(id)
    return _jsonify({
        'ok' : True,
        'definition' : definition
    })

@app.route('/api/dashboard/<id>/definition', methods=['PUT'])
def api_dashboard_update_definition(id):
    """Update the definition of the dashboard. This should use the
    representation returned by /api/dashboard/<id>/definition, and
    should NOT have any embedded variables expanded, nor should it
    have complete graphite URLs in the queries.

    """
    try:
        dashboard = database.Dashboard.query.get_or_404(id)
    except HTTPException as e:
        raise _set_exception_response(e)

    # Validate the payload
    definition = DashboardDefinition.from_json(json.loads(request.data))

    if dashboard.definition:
        dashboard.definition.definition = dumps(definition)
    else:
        dashboard.definition = database.DashboardDef(request.data)

    mgr.store_dashboard(dashboard)

    return _jsonify({ 'ok' : True })

#
# Tags
#

@app.route('/api/tag/')
def api_tag_list():
    """Listing for all tags.

    """
    sql = 'SELECT tag.id, tag.name, tag.description, tag.fgcolor, tag.bgcolor, count(*)' \
    + ' FROM tag' \
    + ' INNER JOIN dashboard_tags' \
    + ' ON dashboard_tags.tag_id = tag.id' \
    + ' GROUP BY tag.id' \
    + ' ORDER BY tag.name'

    tags = []
    for row in db.engine.execute(sql):
        tag = database.Tag(name=row[1], description=row[2], fgcolor=row[3], bgcolor=row[4], count=row[5])
        tag.id = row[0]
        tags.append(tag)

    return _tags_response(tags)

@app.route('/api/tag/<id>')
def api_tag_get(id):
    try:
        tag = database.Tag.query.get_or_404(id)
        return _tags_response(tag)
    except HTTPException as e:
        raise _set_exception_response(e)


#
# Miscellany
#

@app.route('/api/config')
def api_config_get():
    return _jsonify({
        'ok' : True,
        'config' : _get_config()
    })

@app.route('/api/preferences/')
def api_preferences_get():
    return _jsonify({
        'ok' : True,
        'preferences' : _get_preferences()
    })

@app.route('/api/preferences/', methods=['PUT'])
def api_preferences_put():
    _set_preferences(request.json)
    return _jsonify({ 'ok' : True })


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

def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_client_side_dashboard(dashboard, template='dashboard.html', transform=None):
    from_time = _get_param('from', app.config['DEFAULT_FROM_TIME'])
    until_time = _get_param('until', None)
    title = '{0} {1}'.format(dashboard.category, dashboard.title)
    print '_render_client_side_dashboard: transform={0}'.format(transform)
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
    print 'ui_dashboard(): id={0}, slug={1}, path={2}'.format(id, slug, path)
    transform = None
    if path and path.find('transform') > -1:
        element, ignore, name = path.split('/')
        transform = {
            'element': element,
            'name' : name
        }
    try:
        dashboard = database.Dashboard.query.get_or_404(id)
        return _render_client_side_dashboard(dashboard, transform=transform)
    except HTTPException as e:
        raise _set_exception_response(e)
