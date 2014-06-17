import glob
import logging

from invoke import task

from tessera import app, db
from tessera.model.web import Section
from tessera.importer.graphite import GraphiteDashboardImporter
from tessera.importer.json import JsonImporter, JsonExporter


warn = logging.WARN
log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)-8s [%(name)s] %(message)s'
)
logging.getLogger('requests.packages.urllib3.connectionpool').setLevel(warn)
logging.getLogger('sqlalchemy.engine').setLevel(warn)


@task
def run():
    app.run(host='0.0.0.0')

@task
def initdb():
    db.create_all()

@task
def import_graphite_dashboards(
    query='', layout=Section.Layout.FLUID, columns=4, overwrite=False
):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'])
    importer.import_dashboards(
        query, overwrite=overwrite, layout=layout, columns=int(columns)
    )

@task
def dump_graphite_dashboards(query=''):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(app.config['GRAPHITE_URL'])
    importer.dump_dashboards(query)

@task
def export_json(dir, tag=None):
    msg = 'Exporting dashboards (tagged: {0}) as JSON to directory {1}'
    log.info(msg.format(tag, dir))
    JsonExporter.export(dir, tag)

@task
def import_json(pattern):
    log.info('Import dashboards from {0})'.format(pattern))
    files = glob.glob(pattern)
    log.info('Found {0} files to import'.format(len(files)))
    JsonImporter.import_files(files)
