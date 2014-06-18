# -*- mode:python -*-

import os

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Load internal defaults (inside application package)
app.config.from_pyfile('config.py')
# Allow overriding from an external file, pathwise (near project, not app,
# root - is typically one level above app root.)
local = os.path.join(os.getcwd(), 'etc', 'config.py')
app.config.from_pyfile(local, silent=True)
# Final wholly configurable config file location
app.config.from_envvar('TESSERA_CONFIG', silent=True)

db = SQLAlchemy(app)

from views import *
