# -*- mode:python -*-

import flask
import json
import logging
from datetime import datetime
import inflection
from functools import wraps

from flask import render_template, request, url_for
from werkzeug.exceptions import HTTPException

from tessera_client.api.model import *
from . import database
from . import helpers
from .application import db

mgr = database.DatabaseManager(db)
log = logging.getLogger(__name__)

api = flask.Blueprint('api', __name__)

# =============================================================================
# API Helpers
# =============================================================================

def route_api(application, *args, **kwargs):
    def decorator(fn):
        @application.route(*args, **kwargs)
        @wraps(fn)
        def wrapper(*args, **kwargs):
            headers = None
            status_code = 200
            try:
                value = fn(*args, **kwargs)
            except HTTPException as e:
                raise helpers.set_exception_response(e)
            if isinstance(value, tuple):
                if len(value) > 2:
                    headers = value[2]
                status_code = value[1]
                value = value[0]
            return helpers.jsonify(value, status_code, headers)
        return fn
    return decorator

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
    colname = helpers.get_param('sort', 'created')
    order   = helpers.get_param('order')
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
    dash['href']            = url_for('api.dashboard_get', id=id)
    dash['definition_href'] = url_for('api.dashboard_get_definition', id=id)
    dash['view_href']       = url_for('ui.dashboard_with_slug',
                                      id=id,
                                      slug=inflection.parameterize(dash['title']))
    if 'definition' in dash:
        definition = dash['definition']
        definition['href'] = url_for('api.dashboard_get_definition', id=id)
    return dash

def _dashboards_response(dashboards):
    """Return a Flask response object for a list of dashboards in API
format. dashboards must be a list of dashboard model objects, which
will be converted to their JSON representation.
    """
    if not isinstance(dashboards, list):
        dashboards = [dashboards]

    include_definition = helpers.get_param_boolean('definition', False)
    return [ _set_dashboard_hrefs(d.to_json(include_definition=include_definition)) for d in dashboards]

def _set_tag_hrefs(tag):
    """Add ReSTful href attributes to a tag's dictionary
representation.
    """
    id = tag['id']
    tag['href'] = url_for('api.tag_get', id=id)
    return tag

def _tags_response(tags):
    """Return a Flask response object for a list of tags in API
format. tags must be a list of tag model objects, which
will be converted to their JSON representation.
"""
    if not isinstance(tags, list):
        tags = [tags]
    return [_set_tag_hrefs(t.to_json()) for t in tags]

# =============================================================================
# Dashboards
# =============================================================================

@route_api(api, '/dashboard/')
def dashboard_list():
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

@route_api(api, '/dashboard/tagged/<tag>')
def dashboard_list_tagged(tag):
    """Listing for a set of dashboards with a tag applied. Returns just
    the metadata, not the definitions.

    """
    tag = database.TagRecord.query.filter_by(name=tag).first()
    if not tag:
        return _dashboards_response([])
    dashboards = [d for d in tag.dashboards.order_by(_dashboard_sort_column()) if tag]
    return _dashboards_response(dashboards)

@route_api(api, '/dashboard/category/<category>')
def dashboard_list_dashboards_in_category(category):
    """Listing for a set of dashboards in a specified category. Returns
    just the metadata, not the definitions.

    """
    dashboards = [d for d in database.DashboardRecord.query
                  .filter_by(category=category)
                  .order_by(_dashboard_sort_column()) ]
    return _dashboards_response(dashboards)


@route_api(api, '/dashboard/category/')
def dashboard_list_all_dashboard_categories():
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
    return categories

@route_api(api, '/dashboard/<id>')
def dashboard_get(id):
    """Get the metadata for a single dashboard.

    """
    dashboard = database.DashboardRecord.query.get_or_404(id)
    rendering = helpers.get_param('rendering', False)
    include_definition = helpers.get_param_boolean('definition', False)
    dash = _set_dashboard_hrefs(dashboard.to_json(rendering or include_definition))
    if rendering:
        dash['preferences'] = helpers.get_preferences()
    return dash

@route_api(api, '/dashboard/<id>/for-rendering')
def dashboard_get_for_rendering(id):
    """Get a dashboard with its definition, and current settings necessary
for rendering.

    """
    dashboard = database.DashboardRecord.query.get_or_404(id)
    dash = _set_dashboard_hrefs(dashboard.to_json(True))
    return {
        'dashboard' : dash,
        'preferences' : helpers.get_preferences()
    }

@route_api(api, '/dashboard/', methods=['POST'])
def dashboard_create():
    """Create a new dashboard with an empty definition.

    """
    dashboard = database.DashboardRecord.from_json(request.json)
    if not dashboard.title:
        return {
            'error_message': "Missing required field 'title'"
        }, 400
    if 'definition' in request.json:
        dashboard.definition = database.DefinitionRecord(dumps(request.json['definition']))
    else:
        dashboard.definition = database.DefinitionRecord(dumps(DashboardDefinition()))
    mgr.store_dashboard(dashboard)
    href = url_for('api.dashboard_get', id=dashboard.id)
    return {
        'dashboard_href' : href,
        'view_href' : url_for('ui.dashboard_with_slug',
                              id=dashboard.id,
                              slug=inflection.parameterize(dashboard.title))
    }, 201, { 'Location' : href }

@route_api(api, '/dashboard/<id>', methods=['PUT'])
def dashboard_update(id):
    """Update the metadata for an existing dashboard.

    """
    body = json.loads(request.data)
    dashboard = database.DashboardRecord.query.get_or_404(id)
    dashboard.merge_from_json(body)
    mgr.store_dashboard(dashboard)
    # TODO - return similar to create, above
    return {}

@route_api(api, '/dashboard/<id>', methods=['DELETE'])
def dashboard_delete(id):
    """Delete a dashboard. Use with caution.

    """
    dashboard = database.DashboardRecord.query.get_or_404(id)
    db.session.delete(dashboard)
    db.session.commit()
    return {}, 204

@route_api(api, '/dashboard/<id>/definition')
def dashboard_get_definition(id):
    """Fetch the definition for a dashboard. This returns the
    representation to use when modifiying a dashboard.

    """
    dashboard = database.DashboardRecord.query.filter_by(id=id)[0]
    definition = database.DashboardRecord.query.get_or_404(id).definition.to_json()
    definition['href'] = url_for('api.dashboard_get_definition', id=id)
    definition['dashboard_href'] = url_for('api.dashboard_get', id=id)
    return definition

@route_api(api, '/dashboard/<id>/definition', methods=['PUT'])
def dashboard_update_definition(id):
    """Update the definition of the dashboard. This should use the
    representation returned by /api/dashboard/<id>/definition, and
    should NOT have any embedded variables expanded, nor should it
    have complete graphite URLs in the queries.

    """
    dashboard = database.DashboardRecord.query.get_or_404(id)

    # Validate the payload
    definition = DashboardDefinition.from_json(json.loads(request.data.decode('utf-8')))

    if dashboard.definition:
        dashboard.definition.definition = dumps(definition)
    else:
        dashboard.definition = database.DashboardRecordDef(request.data)

    mgr.store_dashboard(dashboard)

    return {}

# =============================================================================
# Tags
# =============================================================================

@route_api(api, '/tag/')
def tag_list():
    """Listing for all tags.

    """
    tags = db.session.query(database.TagRecord).all()
    return _tags_response(tags)

@route_api(api, '/tag/<id>')
def tag_get(id):
    tag = database.TagRecord.query.get_or_404(id)
    return _tags_response(tag)

# =============================================================================
# Miscellany
# =============================================================================

@route_api(api, '/preferences/')
def preferences_get():
    return helpers.get_preferences()

@route_api(api, '/preferences/', methods=['PUT'])
def preferences_put():
    helpers.set_preferences(request.json)
    return helpers.get_preferences()
