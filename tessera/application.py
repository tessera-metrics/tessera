# -*- mode:python -*-

import os
import sys

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
# TODO: shouldn't this come out of the config file so it can be different for
# each installation?
app.secret_key = 'e688f6cb-fc11-65fa-c091-aba197c56c66'

db = SQLAlchemy(app)

from views import *
