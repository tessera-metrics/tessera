# -*- mode:python -*-

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = 'e688f6cb-fc11-65fa-c091-aba197c56c66'
db = SQLAlchemy(app)

from views import *
