# -*- mode:python -*-

import flask
import json
import sys
import datetime
import time
import os.path
import inflection

from flask import Flask, render_template, request, redirect, jsonify, abort

import toolbox
from toolbox.graphite import Graphite, GraphiteQuery
from .demo import demo_dashboard
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

# =============================================================================
# UI: Basics
# =============================================================================


@app.route('/')
def ui_root():
    return _render_template('index.html',
                            breadcrumbs=[('Home', '/')])

@app.route('/demo')
def ui_demo():
    dashboard  = demo_dashboard(env,
                                request.args.get('from', app.config['DEFAULT_FROM_TIME']),
                                request.args.get('until', None))
    return _render_template('dashboard.html',
                            dashboard=dashboard,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/'),
                                         ('{0} {1}'.format(dashboard.category, dashboard.title), '')])
