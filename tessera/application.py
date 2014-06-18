# -*- mode:python -*-

import sys

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Load internal defaults
app.config.from_pyfile('config.py')
# Allow overriding from an external file
app.config.from_envvar('TESSERA_CONFIG', silent=True)
# TODO: shouldn't this come out of the config file so it can be different for
# each installation?
app.secret_key = 'e688f6cb-fc11-65fa-c091-aba197c56c66'

db = SQLAlchemy(app)

from views import *
