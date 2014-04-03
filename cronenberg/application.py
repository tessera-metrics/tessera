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
app.config.from_pyfile('config.py')

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
    context = {
        'total' : datastore.fetch(queries.automation_total_pushes()),
        'api-rate' : datastore.fetch(queries.automation_api_rates()),
        'api-latency' : datastore.fetch(queries.automation_api_latency()),
        'payload' : datastore.fetch(queries.automation_push_payloads()),
        'platform-count' : datastore.fetch(queries.automation_push_platform_counts()),
        'platform-rate' : datastore.fetch(queries.automation_push_platform_rates()),
        'triggers' : datastore.fetch(queries.automation_triggers_processed()),
        'events' : datastore.fetch(queries.automation_events())
    }
    return _render_template('index.html', title='Home',
                            context=context,
                            breadcrumbs=[('Home','')])
