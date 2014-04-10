#!/usr/bin/env python

import json
import toolbox
from cronenberg.model import *
from cronenberg.data import Queries
from cronenberg.cask.storage import EntityEncoder
from toolbox.graphite.functions import *

q = Queries(toolbox.PROD)

dash = Dashboard(name='Automation Overview',
                 queries={ 'api-rate' : str(q.automation_api_rates()),
                           'api-latency' : str(q.automation_api_latency()) },
                 grid=Grid(rows=[
                     [ GridEntry(span=3, presentation=SingleStatPresentation(title='Raw Events Processed',
                                                                             query_name='api-rate',
                                                                             transform='sum')),
                       GridEntry(span=9, presentation=ChartPresentation(title="Foos",
                                                                        query_name="api-latency",
                                                                        chart_type='timeseries')) ]
                 ]))

#print dash.queries['api-rate']


print json.dumps(dash, cls=EntityEncoder, indent=4)
#print json.dumps(target, cls=EntityEncoder, indent=4)

#print vars(target)
#print dir(target)

#print str(target)
#print vars(target)

#print json.dumps(dash.to_json(), indent=4, sort_keys=True)

#print group(1,1).to_json()
