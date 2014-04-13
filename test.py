#!/usr/bin/env python

import json
import toolbox
from cronenberg.demo import demo_dashboard
from cronenberg.cask.storage import EntityEncoder
from cronenberg.model import *

def dump():
    dash = demo_dashboard(toolbox.PROD)
    print json.dumps(dash, cls=EntityEncoder, indent=4, sort_keys=True)

def load():
    with open("test1.json", "r") as f:
        data = json.load(f)
        dash = Dashboard.from_json('automation_overview', data)
        print json.dumps(dash, cls=EntityEncoder, indent=4, sort_keys=True)

load()
