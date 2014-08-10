import glob
import logging

from invoke import ctask as task, Collection
from invocations.testing import test

from tessera import app, db
from tessera_client.api.model import Section
from tessera.importer.graphite import GraphiteDashboardImporter
from tessera.importer.json import JsonImporter, JsonExporter

import flask
from flask.ext import migrate

warn = logging.WARN
log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)-8s [%(name)s] %(message)s'
)
logging.getLogger('requests.packages.urllib3.connectionpool').setLevel(warn)
logging.getLogger('sqlalchemy.engine').setLevel(warn)

DEFAULT_TESSERA_URL  = 'http://{0}:{1}'.format(app.config['SERVER_ADDRESS'], app.config['SERVER_PORT'])
DEFAULT_GRAPHITE_URL = app.config['GRAPHITE_URL']

@task
def run(c):
    """Launch the server."""
    app.run(host='0.0.0.0')

# =============================================================================
# db collection
#  inv db init
# =============================================================================

@task
def initdb(c):
    """Deprecated, use db.init instead."""
    db.create_all()

@task(name='init')
def db_init(c):
    db.create_all()

@task(name='init_migrations')
def db_init_migrations(c, dir=None):
    with app.app_context():
        migrate.init(dir)

@task(name='current')
def db_current(c):
    with app.app_context():
        migrate.current()

@task(name='revision')
def db_revision(c):
    with app.app_context():
        migrate.revision()

@task(name='migrate')
def db_migrate(c):
    with app.app_context():
        migrate.migrate()

@task(name='upgrade')
def db_upgrade(c):
    with app.app_context():
        migrate.upgrade()

@task(name='downgrade')
def db_downgrade(c):
    with app.app_context():
        migrate.downgrade()

@task(name='stamp')
def db_stamp(c):
    with app.app_context():
        pass

@task(name='history')
def db_history(c):
    with app.app_context():
        migrate.history()

# =============================================================================
# graphite tasks
#   inv graphite import
#   inv graphite export
# =============================================================================

@task(name='import')
def import_graphite_dashboards(
    c, query='', layout=Section.Layout.FLUID, columns=4, overwrite=False,
    graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL
):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(graphite, tessera)
    importer.import_dashboards(
        query, overwrite=overwrite, layout=layout, columns=int(columns)
    )

@task(name='dump')
def dump_graphite_dashboards(c, query='', graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(graphite, tessera)
    importer.dump_dashboards(query)

# =============================================================================
# json tasks
#  inv json import
#  inv json export
# =============================================================================

@task(name='export')
def export_json(c, dir, tag=None, graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    msg = 'Exporting dashboards (tagged: {0}) as JSON to directory {1}'
    log.info(msg.format(tag, dir))
    exporter = JsonExporter(graphite, tessera)
    exporter.export(dir, tag)

@task(name='import')
def import_json(c, pattern, graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    log.info('Import dashboards from {0})'.format(pattern))
    files = glob.glob(pattern)
    log.info('Found {0} files to import'.format(len(files)))
    importer = JsonImporter(graphite, tessera)
    importer.import_files(files)

# =============================================================================
# test tasks
#  inv test unit
#  inv test integration
# =============================================================================

@task
def integration(c):
    """
    Run high level integration test suite.
    """
    return test(c, opts="--tests=integration")

tests = Collection('test')
tests.add_task(test, name='unit', default=True)
tests.add_task(integration)


ns = Collection(
    run,
    initdb,
    tests,
    Collection('db',
               db_init,
               db_init_migrations,
               db_current,
               db_revision,
               db_migrate,
               db_upgrade,
               db_downgrade,
               db_stamp,
               db_history
           ),
    Collection('json', import_json, export_json),
    Collection('graphite',
        import_graphite_dashboards,
        dump_graphite_dashboards,
    ),
)
