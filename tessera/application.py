# -*- mode:python -*-

import logging
import os

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.migrate import Migrate
from werkzeug.wsgi import DispatcherMiddleware

log = logging.getLogger(__name__)

def configure(app):
    # Load internal defaults (inside application package)
    app.config.from_pyfile('config.py')
    # Allow overriding from an external file, pathwise (near project, not app,
    # root - is typically one level above app root.)
    local = os.path.join(os.getcwd(), 'etc', 'config.py')
    try:
        app.config.from_pyfile(local)
    except IOError as e:
        # It's fine to not have this file, just log for debugging.
        log.debug("Local override config {0!r} not found, skipping".format(local))
    # Wholly configurable config file location via env var.
    # Only load if set, and then let it explode on its own if target not found.
    if os.environ.get('TESSERA_CONFIG', False):
        app.config.from_envvar('TESSERA_CONFIG')
    return app

app     = configure(Flask(__name__))
db      = SQLAlchemy(app)
migrate = Migrate(app, db)
config  = app.config

from views_api import api
from views_ui import ui

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(ui)

app_root = app.config.get('APPLICATION_ROOT', None)
if app_root:
    app = DispatcherMiddleware(Flask('root'), {
        app_root : app
    })
