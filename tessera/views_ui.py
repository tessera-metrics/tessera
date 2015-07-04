# -*- mode:python -*-

import flask
import logging
from datetime import datetime

from flask import render_template, url_for
from werkzeug.exceptions import HTTPException

from tessera_client.api.model import *
from . import database
from . import helpers
from ._version import __version__

log = logging.getLogger(__name__)

ui = flask.Blueprint('ui', __name__)

# =============================================================================
# UI Helpers
# =============================================================================

class RenderContext:
    def __init__(self):
        self.now = datetime.now()
        self.prefs = helpers.get_preferences()
        self.version = __version__

    def get(self, key, default=None, store_in_session=False):
        return helpers.get_param(key, default=default, store_in_session=store_in_session)

    def get_int(self, key, default=0, store_in_session=False):
        return int(self.get(key, default=default, store_in_session=store_in_session) or 0)

    def get_str(self, key, default=None, store_in_session=False):
        return str(self.get(key, default=default, store_in_session=store_in_session))


def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_client_side_dashboard(dashboard, template='dashboard.html', transform=None):
    from_time = helpers.get_param('from', helpers.cfg('DEFAULT_FROM_TIME', '-3h'))
    until_time = helpers.get_param('until', None)
    title = '{0} {1}'.format(dashboard.category, dashboard.title)
    return _render_template(template,
                            dashboard=dashboard,
                            definition=dashboard.definition,
                            from_time=from_time,
                            until_time=until_time,
                            title=title,
                            transform=transform,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         ('Dashboards', url_for('ui.dashboard_list')),
                                         (title, '')])

# =============================================================================
# UI Endpoints
# =============================================================================

@ui.route('/')
def root():
    return _render_template('index.html', breadcrumbs=[('Home', url_for('ui.root'))])

@ui.route('/preferences/')
def preferences():
    helpers.get_preferences(store_in_session=True),
    title = 'User Preferences'
    return _render_template('preferences.html',
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         (title, '')])

@ui.route('/favorites/')
def favorites():
    title = 'Favorites'
    return _render_template('favorites.html',
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         (title, '')])

@ui.route('/import/')
def dashboard_import():
    title = 'Import Dashboards'
    return _render_template('import.html',
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         (title, '')])

@ui.route('/dashboards/')
def dashboard_list():
    title = 'Dashboards'
    return _render_template('dashboard-list.html',
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         (title, '')])

@ui.route('/dashboards/create/')
def dashboard_create():
    title = 'New Dashboard'
    return _render_template('dashboard-create.html',
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         ('Dashboards', url_for('ui.dashboard_list')),
                                         (title, '')])


@ui.route('/dashboards/tagged/<tag>')
def dashboard_list_tagged(tag):
    title = 'Dashboards'
    return _render_template('dashboard-list.html',
                            tag=tag,
                            title=title,
                            breadcrumbs=[('Home', url_for('ui.root')),
                                         (title, '')])


@ui.route('/dashboards/<id>/<slug>', defaults={'path' : ''})
@ui.route('/dashboards/<id>/<slug>/<path:path>')
def dashboard_with_slug(id, slug, path):
    return dashboard(id, slug, path)

@ui.route('/dashboards/<id>/<slug>/embed')
def dashboard_with_slug_embed(id, slug):
    return dashboard(id, slug, template='dashboard-embed.html')

@ui.route('/dashboards/<id>/')
def dashboard(id, slug=None, path=None, template='dashboard.html'):
    transform = None
    if path and path.find('transform') > -1:
        components = path.split('/')
        if len(components) == 2:
            name = components[1]
            element = slug
        elif len(components) == 3:
            element, ignore, name = components
        transform = {
            'element': element,
            'name' : name
        }
    try:
        dashboard = database.DashboardRecord.query.get_or_404(id)
        return _render_client_side_dashboard(dashboard, transform=transform, template=template)
    except HTTPException as e:
        raise helpers.set_exception_response(e)
