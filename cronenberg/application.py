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
        'total'          : datastore.fetch(queries.automation_total_pushes()),
        'api-rate'       : datastore.fetch(queries.automation_api_rates()),
        'api-latency'    : datastore.fetch(queries.automation_api_latency()),
        'payload'        : datastore.fetch(queries.automation_push_payloads()),
        'platform-count' : datastore.fetch(queries.automation_push_platform_counts()),
        'platform-rate'  : datastore.fetch(queries.automation_push_platform_rates()),
        'triggers'       : datastore.fetch(queries.automation_triggers_processed()),
        'events'         : datastore.fetch(queries.automation_events()),
        'delivery'       : datastore.fetch(queries.automation_end_to_end_delivery_time())
    }

    # HACK HACK HACK
    for datalist in context.values():
        for data in datalist:
            data['json'] = json.dumps([{ 'key' : 'data', 'values': data['values'] }])

    context['total-events-processed']    = '{:,}'.format(int(context['events'][4]['sum'] + context['events'][2]['sum']))
    context['triggers-processed']        = '{:,}'.format(int(context['triggers'][8]['sum']))
    context['triggers-satisfied']        = '{:,}'.format(int(context['triggers'][9]['sum']))
    context['pushes-sent']               = '{:,}'.format(int(context['total'][0]['sum']))
    context['average-push-rate']         = '{:.3f}'.format(context['total'][1]['avg'])
    context['average-end-to-end']        = '{0}'.format(int(context['delivery'][0]['avg']))
    context['immediate-processed-rate'] = '{:0.3f}'.format(context['triggers'][0]['avg'])
    context['immediate-satisfied-rate'] = '{:0.3f}'.format(context['triggers'][2]['avg'])
    context['historical-processed-rate'] = '{:0.3f}'.format(context['triggers'][4]['avg'])
    context['historical-satisfied-rate'] = '{:0.3f}'.format(context['triggers'][6]['avg'])
    context['api-mean-latency']          = '{:0.2f}'.format(context['api-latency'][0]['avg'])
    context['api-total']                 = '{0}'.format(int(context['api-rate'][1]['sum']))
    context['mean-device-opens-rate']    = '{0}'.format(int(context['events'][1]['avg']))

    return _render_template('index.html',
                            app='Automation',
                            title='Overview',
                            context=context,
                            breadcrumbs=[('Home','')])
