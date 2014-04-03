# -*- mode:python -*-

import flask
import json
import sys
import datetime
import time
import os.path

from flask import Flask, render_template, request, redirect, jsonify, abort

import toolbox
from data import Queries, Datastore

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)

env = toolbox.PROD
queries = Queries(env)
datastore = Datastore(env)

# =============================================================================
# Template Helpers
# =============================================================================

def _render_template(template, **kwargs):
    now = datetime.datetime.now()
    return render_template(template, now=now, **kwargs)

# =============================================================================
# UI: Basics
# =============================================================================

@app.route('/')
def ui_root():
    return _render_template('index.html', title='Home',
                           breadcrumbs=[('Home','')])
