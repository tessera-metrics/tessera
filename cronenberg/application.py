# -*- mode:python -*-

import flask
import json
import sys
import copy
import datetime
import time
import os.path
import inflection

from flask import Flask, render_template, request, redirect, jsonify, abort

import toolbox
from toolbox.graphite import Graphite, GraphiteQuery
from .demo import demo_dashboard, gbc_demo_dashboard
from .model import *

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)
app.config.from_pyfile('config.py')

env = toolbox.PROD
graphite = env.graphite()

# =============================================================================
# Template Helpers
# =============================================================================

class RenderContext:
    def __init__(self):
        self.now = datetime.datetime.now()
        self.element_index = 0

    def nextid(self):
        self.element_index += 1
        return 'e' + self.element_index

def _render_template(template, **kwargs):
    return render_template(template, ctx=RenderContext(), **kwargs)

def _render_dashboard(dash):
    from_time = request.args.get('from', app.config['DEFAULT_FROM_TIME'])
    until_time = request.args.get('until', None)

    # Make a copy of the query map with all targets rendered to full
    # graphite URLs
    queries = {}
    for k, v in dash.queries.iteritems():
        query = GraphiteQuery(v, format=Graphite.Format.JSON, from_time=from_time, until_time=until_time)
        queries[k] = str(graphite.render_url(query))

    # Make a shallow copy of the dashboard with the queries member
    # replaced with the expanded version
    dashboard = copy.copy(dash)
    dashboard.queries = queries
    return _render_template('dashboard.html',
                            dashboard=dashboard,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/'),
                                         ('{0} {1}'.format(dashboard.category, dashboard.title), '')])


# =============================================================================
# UI: Basics
# =============================================================================


@app.route('/')
def ui_root():
    return _render_template('index.html', breadcrumbs=[('Home', '/')])

@app.route('/demo/automation')
def ui_demo_automation():
    return _render_dashboard(demo_dashboard(env))

@app.route('/demo/gbc')
def ui_demo_gbc():
    return _render_dashboard(gbc_demo_dashboard())
