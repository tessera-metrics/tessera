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
from data import Queries

# =============================================================================
# Setup
# =============================================================================

app = Flask(__name__)
app.config.from_pyfile('config.py')

env = toolbox.PROD
q = Queries(env)
graphite = env.graphite()



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
    from_time = request.args.get('from', '-12h')
    until_time = request.args.get('until', None)

    queries = {
        'total_events_processed'   : q.total_events_processed(),
        'total_triggers_processed' : q.total_triggers_processed(),
        'total_triggers_satisfied' : q.total_triggers_satisfied(),
        'total_pushes_sent' : q.total_pushes_sent(),
        'total_push_rate'   : q.total_push_rate(),
        'end_to_end'        : q.automation_end_to_end_delivery_time(),
        'immediate_triggers'        : q.immediate_triggers(),
        'historical_triggers'        : q.historical_triggers(),
        'api_rate'       : q.automation_api_rates(),
        'api_latency'    : q.automation_api_latency(),
        'device_event_rate' : q.device_event_rate()
    }

    for k,v in queries.items():
        # TODO - inflection.underscore() the key, to ensure it's JS
        # safe
        query = GraphiteQuery(v, format=Graphite.Format.JSON, from_time=from_time, until_time=until_time)
        queries[k] = str(graphite.render_url(query))

    # context = {}
    # context['total-events-processed']    = 10 #'{:,}'.format(int(context['events'][4]['sum'] + context['events'][2]['sum']))
    # context['triggers-processed']        = 10 #'{:,}'.format(int(context['triggers'][8]['sum']))
    # context['triggers-satisfied']        = 10 #'{:,}'.format(int(context['triggers'][9]['sum']))
    # context['pushes-sent']               = 10 #'{:,}'.format(int(context['total'][0]['sum']))
    # context['average-push-rate']         = 10 #'{:.3f}'.format(context['total'][1]['avg'])
    # context['average-end-to-end']        = 10 #'{0}'.format(int(context['delivery'][0]['avg']))
    # context['immediate-processed-rate'] = 10 #'{:0.3f}'.format(context['triggers'][0]['avg'])
    # context['immediate-satisfied-rate'] = 10 #'{:0.3f}'.format(context['triggers'][2]['avg'])
    # context['historical-processed-rate'] = 10 #'{:0.3f}'.format(context['triggers'][4]['avg'])
    # context['historical-satisfied-rate'] = 10 #'{:0.3f}'.format(context['triggers'][6]['avg'])
    # context['api-mean-latency']          = 10 #'{:0.2f}'.format(context['api-latency'][0]['avg'])
    # context['api-total']                 = 10 #'{0}'.format(int(context['api-rate'][1]['sum']))
    # context['mean-device-opens-rate']    = 10 #'{0}'.format(int(context['events'][1]['avg']))

    return _render_template('index.html',
                            app='Automation',
                            title='Overview',
                            queries=queries,
                            breadcrumbs=[('Home','')])
