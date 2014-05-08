# -*- mode:python -*-

import flask
import json
import logging
import copy
import datetime
import inflection
import urllib

from flask import Flask, render_template, request, redirect, jsonify, abort, session
from flask.ext.sqlalchemy import SQLAlchemy

# =============================================================================
# Setup
# =============================================================================

log = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = 'e688f6cb-fc11-65fa-c091-aba197c56c66'
db = SQLAlchemy(app)

from views import *
