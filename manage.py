#!/usr/bin/env python

import json
from flask.ext.script import Manager
import toolbox
import logging
from cronenberg import app
from cronenberg.demo import *
from cronenberg.model import Dashboard, DashboardManager
from cronenberg.cask.storage import EntityEncoder

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)-8s [%(name)s] %(message)s')

manager = Manager(app)
models = DashboardManager(app.config['DASHBOARD_DATADIR'])

@manager.command
def run():
    app.run(host='0.0.0.0')

@manager.command
def generate():
    log.info('Generating demo dashboards...')
    dashboards = [
        gbc_demo_dashboard(),
        demo_dashboard(toolbox.PROD),
        random_data_dashboard()
    ]
    for d in dashboards:
        log.info('Storing dashboard {0}...'.format(d.name))
        models.store(Dashboard, d)
    log.info('Done')


if __name__ == '__main__':
    manager.run()
