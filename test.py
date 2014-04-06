#!/usr/bin/env python

import json
from cronenberg.model import *
from cronenberg.cask.storage import EntityEncoder

dash = Dashboard(name='Automation Overview',
                 queries={ 'events' : Query('events', targets=['foo.Count']),
                           'bars' : Query('bars', targets=['bar.Count']) },
                 grid=Grid(rows=[
                     [ GridEntry(span=3, presentation=SingleStatPresentation(title='Raw Events Processed',
                                                                             query='events',
                                                                             attribute='sum')),
                       GridEntry(span=9, presentation=ChartPresentation(title="Foos",
                                                                        query="bars",
                                                                        chart_type='timeseries')) ]
                 ]))

print json.dumps(dash, cls=EntityEncoder, indent=4)
