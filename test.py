#!/usr/bin/env python

import json
import toolbox
from cronenberg.demo import demo_dashboard
from cronenberg.cask.storage import EntityEncoder
from cronenberg.application import demo_dashboard

dash = demo_dashboard(toolbox.PROD)

print json.dumps(dash, cls=EntityEncoder, indent=4)
