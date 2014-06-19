# -*- mode:python -*-

import logging
import os

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy


log = logging.getLogger(__name__)

app = Flask(__name__)

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
# Final wholly configurable config file location
# Only load if set, and then let it explode on its own if target not found.
if os.environ.get('TESSERA_CONFIG', False):
    app.config.from_envvar('TESSERA_CONFIG')

db = SQLAlchemy(app)

from views import *
