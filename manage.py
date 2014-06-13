#!/usr/bin/env python

import json
import glob
from flask.ext.script import Manager
import logging
from tessera import app, db
from tessera.demo import *
from tessera.model import DashboardDefinition
from tessera.model.web import Section
from tessera.importer.graphite import GraphiteDashboardImporter
from tessera.importer.json import JsonImporter, JsonExporter

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)-8s [%(name)s] %(message)s')
logging.getLogger('requests.packages.urllib3.connectionpool').setLevel(logging.WARN)
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARN)

manager = Manager(app)
dbmgr = database.DatabaseManager(db)

@manager.command
def run():
    app.run(host='0.0.0.0')

@manager.command
def generate():
    log.info('Generating demo dashboards')
    dashboards = [
        demo_gallery_dashboard(),
        demo_random_data_dashboard()
    ]
    for d in dashboards:
        log.info('Storing dashboard {0} {1}'.format(d.category, d.title))
        dbmgr.store_dashboard(d)
    log.info('Done')

@manager.command
def createdb():
    db.create_all()

@manager.command
def initdb():
    createdb()
    generate()

@manager.command
def import_graphite_dashboards(query='', layout=Section.Layout.FLUID, columns=4, overwrite=False):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'])
    importer.import_dashboards(query, overwrite=overwrite, layout=layout, columns=int(columns))

@manager.command
def dump_graphite_dashboards(query=''):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'])
    importer.dump_dashboards(query)

@manager.command
def export_json(dir, tag=None):
    log.info('Exporting dashboards (tagged: {0}) as JSON to directory {1}'.format(tag, dir))
    JsonExporter.export(dir, tag)

@manager.command
def import_json(pattern):
    log.info('Import dashboards from {0})'.format(pattern))
    files = glob.glob(pattern)
    log.info('Found {0} files to import'.format(len(files)))
    JsonImporter.import_files(files)

if __name__ == '__main__':
    manager.run()
