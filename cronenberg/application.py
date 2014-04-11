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

def demo_dashboard(from_time, until_time):
    queries = {
        'total_events_processed'   : q.total_events_processed(),
        'total_triggers_processed' : q.total_triggers_processed(),
        'total_triggers_satisfied' : q.total_triggers_satisfied(),
        'total_pushes_sent'        : q.total_pushes_sent(),
        'total_push_rate'          : q.total_push_rate(),
        'end_to_end'               : q.automation_end_to_end_delivery_time(),
        'immediate_triggers'       : q.immediate_triggers(),
        'historical_triggers'      : q.historical_triggers(),
        'api_rate'                 : q.automation_api_rates(),
        'api_latency'              : q.automation_api_latency(),
        'device_event_rate'        : q.device_event_rate(),
        'stacked_test' : q.automation_push_payloads(),
        'gatekeeper' : "aliasByNode(scaleToSeconds(nonNegativeDerivative(servers.*.rash.gatekeeper.requestmetrics.http_2xx_responses.endpoint_push.Count),1), 1)"
    }

    for k,v in queries.items():
        # TODO - inflection.underscore() the key, to ensure it's JS
        # safe
        query = GraphiteQuery(v, format=Graphite.Format.JSON, from_time=from_time, until_time=until_time)
        queries[k] = str(graphite.render_url(query))


    dash = Dashboard(name='automation_overview',
                     category='Automation',
                     title='Overview',
                     queries=queries,
                     grid=Grid(Row(Cell(span=3, emphasize=True, align='center',
                                        presentation=SingleStat(title='Raw Events Processed',
                                                                query_name='total_events_processed',
                                                                decimal=0,
                                                                transform='sum')),
                                   Cell(span=3, emphasize=True, align='center',
                                        presentation=SingleStat(title='Triggers Processed',
                                                                query_name='total_triggers_processed',
                                                                decimal=0,
                                                                transform='sum')),
                                   Cell(span=3, emphasize=True, align='center',
                                        presentation=SingleStat(title='Triggers Satisifed',
                                                                query_name='total_triggers_satisfied',
                                                                decimal=0,
                                                                transform='sum')),
                                   Cell(span=3, emphasize=True, align='center',
                                        presentation=SingleStat(title='Pushes Sent',
                                                                query_name='total_pushes_sent',
                                                                decimal=0,
                                                                transform='sum'))),
                               Separator(),
                               Row(Cell(span=2, offset=2,
                                        presentation=SingleStat(title='Mean Push Rate',
                                                                query_name='total_push_rate',
                                                                units='/sec',
                                                                decimal=3,
                                                                transform='mean')),
                                   Cell(span=8, presentation=SimpleTimeSeries(query_name='total_push_rate'))),
                               Row(Cell(span=2, offset=2,
                                        presentation=SingleStat(title='Mean End to End Delivery Time',
                                                                query_name='end_to_end',
                                                                units=' ms',
                                                                decimal=2,
                                                                transform='mean')),
                                   Cell(span=8, presentation=SimpleTimeSeries(query_name='end_to_end'))),
                               Row(Cell(span=2,
                                        presentation=SingleStat(title='Immediate Triggers Processed',
                                                                query_name='immediate_triggers',
                                                                units='/sec',
                                                                decimal=2)),
                                   Cell(span=2,
                                        presentation=SingleStat(title='Immediate Triggers Satisfied',
                                                                query_name='immediate_triggers',
                                                                units='/sec',
                                                                index=3,
                                                                decimal=2)),
                                   Cell(span=8,
                                        presentation=SimpleTimeSeries(query_name='immediate_triggers'))),
                               Row(Cell(span=2,
                                        presentation=SingleStat(title='Historical Triggers Processed',
                                                                query_name='historical_triggers',
                                                                units='/sec',
                                                                decimal=2)),
                                   Cell(span=2,
                                    presentation=SingleStat(title='Historical Triggers Satisfied',
                                                            query_name='historical_triggers',
                                                            units='/sec',
                                                            index=3,
                                                            decimal=2)),
                                   Cell(span=8,
                                        presentation=SimpleTimeSeries(query_name='historical_triggers'))),
                               Row(Cell(span=2,
                                        presentation=SingleStat(title='Mean API Response Time',
                                                                query_name='api_latency',
                                                                units=' ms',
                                                                decimal=2)),
                                   Cell(span=2,
                                        presentation=SingleStat(title='API Requests',
                                                                query_name='api_rate',
                                                                index=1,
                                                                decimal=0,
                                                                transform='sum')),
                                   Cell(span=8,
                                        presentation=SimpleTimeSeries(query_name='api_rate'))),
                               Row(Cell(span=2, offset=2,
                                        presentation=SingleStat(title='Mean Device Opens Rate',
                                                                query_name='device_event_rate',
                                                                units='/sec',
                                                                decimal=0)),
                                   Cell(span=8,
                                        presentation=SimpleTimeSeries(query_name='device_event_rate'))),
                               Row(Cell(span=8, offset=4,
                                        presentation=StackedAreaChart(css_class='height4', query_name='gatekeeper'))))
    )
    #Row(Cell(span=12,
    #        presentation=StackedAreaChart(query_name='stacked_test')))
    return dash

@app.route('/')
def ui_root():
    # TODO - this -3h default needs to be in a constant; also used in
    # recent-range-picker template
    from_time = request.args.get('from', '-3h')
    until_time = request.args.get('until', None)
    dashboard = demo_dashboard(from_time, until_time)

    return _render_template('dashboard.html',
                            dashboard=dashboard,
                            breadcrumbs=[('Home', '/'),
                                         ('Dashboards', '/'),
                                         ('{0} {1}'.format(dashboard.category, dashboard.title), '')])
