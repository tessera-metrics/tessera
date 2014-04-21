#!/usr/bin/env python

import json
from flask.ext.script import Manager
import toolbox
import logging
from cronenberg import app, db
from cronenberg.demo import *
from cronenberg.model import DashboardDefinition, DashboardManager
from cronenberg.cask.storage import EntityEncoder
from cronenberg.importer.graphite import GraphiteDashboardImporter

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)-8s [%(name)s] %(message)s')
logging.getLogger('requests.packages.urllib3.connectionpool').setLevel(logging.WARN)

manager = Manager(app)
models = DashboardManager(app.config['DASHBOARD_DATADIR'])

@manager.command
def run():
    app.run(host='0.0.0.0')

@manager.command
def generate():
    log.info('Generating demo dashboards')
    dashboards = [
        demo_automation_overview(toolbox.PROD),
        demo_random_data_dashboard(),
        demo_gallery_dashboard(),
        demo_node_dashboard()
    ]
    for d in dashboards:
        log.info('Storing dashboard {0}'.format(d.name))
        models.store(DashboardDefinition, d)
    log.info('Done')

@manager.command
def create_db():
    db.create_all()

@manager.command
def import_graphite_dashboards(query=''):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'], models)
    importer.import_dashboards(query)

@manager.command
def dump_graphite_dashboards(query=''):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'], models)
    importer.dump_dashboards(query)

if __name__ == '__main__':
    manager.run()
