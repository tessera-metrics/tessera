# -*- mode:python -*-

import flask
import json
import sys
import datetime
import time
import os.path

from flask import Flask, render_template, request, redirect, jsonify, abort

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)

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
