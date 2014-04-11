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
from .data import Queries
from .model import *

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
    # TODO - this -3h default needs to be in a constant; also used in
    # recent-range-picker template
    from_time = request.args.get('from', '-3h')
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


    grid = Grid(Row(Cell(span=3, emphasize=True,
                         presentation=SingleStat(title='Raw Events Processed',
                                                 query_name='total_events_processed',
                                                 align='center',
                                                 decimal=0,
                                                 transform='sum')),
                    Cell(span=3, emphasize=True,
                         presentation=SingleStat(title='Triggers Processed',
                                                 query_name='total_triggers_processed',
                                                align='center',
                                                 decimal=0,
                                                 transform='sum')),
                    Cell(span=3, emphasize=True,
                         presentation=SingleStat(title='Triggers Satisifed',
                                                 query_name='total_triggers_satisfied',
                                                align='center',
                                                 decimal=0,
                                                 transform='sum')),
                    Cell(span=3, emphasize=True,
                         presentation=SingleStat(title='Pushes Sent',
                                                 query_name='total_pushes_sent',
                                                 align='center',
                                                 decimal=0,
                                                transform='sum'))
                ),
                Separator(),
                Row(Cell(span=2, offset=2,
                         presentation=SingleStat(title='Mean Push Rate',
                                                 query_name='total_push_rate',
                                                 units='/sec',
                                                 decimal=3,
                                                 transform='mean')),
                    Cell(span=8, presentation=SimpleTimeSeries(query_name='total_push_rate'))
                )
    )
    return _render_template('index.html',
                            app='Automation',
                            title='Overview',
                            queries=queries,
                            grid=grid,
                            breadcrumbs=[('Home','')])
