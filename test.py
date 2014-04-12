#!/usr/bin/env python

import json
import toolbox
from cronenberg.model import *
from cronenberg.data import Queries
from cronenberg.cask.storage import EntityEncoder
from toolbox.graphite.functions import *
from cronenberg.application import demo_dashboard

q = Queries(toolbox.PROD)

dash = demo_dashboard('-3h', None)

print json.dumps(dash, cls=EntityEncoder, indent=4)
#print json.dumps(target, cls=EntityEncoder, indent=4)

#print vars(target)
#print dir(target)

#print str(target)
#print vars(target)

#print json.dumps(dash.to_json(), indent=4, sort_keys=True)

#print group(1,1).to_json()
