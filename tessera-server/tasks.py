import glob
import logging
import os
import sys
from urlparse import urljoin

import requests
from requests.exceptions import ConnectionError

from invoke import ctask as task, Collection
from invocations.testing import test

from tessera import app, db, config
from tessera_client.api.model import Section
from tessera.importer.graphite import GraphiteDashboardImporter
from tessera.importer.json_importer import JsonImporter, JsonExporter
from werkzeug.serving import run_simple

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

DEFAULT_TESSERA_URL   = 'http://{0}:{1}'.format(config['SERVER_ADDRESS'], config['SERVER_PORT'])
DEFAULT_GRAPHITE_URL  = config['GRAPHITE_URL']
DEFAULT_MIGRATION_DIR = config['MIGRATION_DIR']

@task
def run(c):
    """Launch the server."""
    run_simple(config['SERVER_ADDRESS'], config['SERVER_PORT'], app, use_reloader=True)

# =============================================================================
# db collection
#  inv db.init
#  inv db.init_migrations
#  inv db.current
#  inv db.revisions
#  inv db.migrate
#  inv db.upgrade
#  inv db.downgrade
#  inv db.stamp
#  inv db.history
# =============================================================================

@task
def initdb(c):
    """
    Deprecated, use db.init instead.
    """
    db.create_all()

@task(name='init')
def db_init(c):
    """
    Set up a new, empty database.
    """
    db.create_all()

@task(name='init_migrations')
def db_init_migrations(c, dir=None):
    """
    Update the project to support migrations.
    """
    with app.app_context():
        migrate.init(dir)

@task(name='current')
def db_current(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Show current migration revision.
    """
    with app.app_context():
        migrate.current(directory=dir)

@task(name='revision')
def db_revision(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Generate new empty revision script.
    """
    with app.app_context():
        migrate.revision(directory=dir)

@task(name='migrate')
def db_migrate(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Generate new autofilled migration.
    """
    with app.app_context():
        migrate.migrate(directory=dir)

@task(name='upgrade')
def db_upgrade(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Run any migrations needed make database current.
    """
    with app.app_context():
        migrate.upgrade(directory=dir)

@task(name='downgrade')
def db_downgrade(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Downgrade database to a specific revision.
    """
    with app.app_context():
        migrate.downgrade(directory=dir)

@task(name='stamp')
def db_stamp(c, dir=DEFAULT_MIGRATION_DIR):
    """
    Set database revision to a specific value.
    """
    with app.app_context(directory=dir):
        pass

@task(name='history')
def db_history(c, dir=DEFAULT_MIGRATION_DIR):
    """
    List migration history.
    """
    with app.app_context():
        migrate.history(directory=dir)

# =============================================================================
# graphite tasks
#   inv graphite.import
#   inv graphite.export
# =============================================================================

@task(name='import')
def import_graphite_dashboards(
    c, query='', layout=Section.Layout.FLUID, columns=4, overwrite=False,
    graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL
):
    """
    Import dashboards from a Graphite vanilla dashboard.
    """
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(graphite, tessera, config['GRAPHITE_AUTH'])
    importer.import_dashboards(
        query, overwrite=overwrite, layout=layout, columns=int(columns)
    )

@task(name='dump')
def dump_graphite_dashboards(c, query='', graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    """
    Dump Graphite dashboards to stdout in Tessera JSON format.
    """
    log.info('Importing dashboards from graphite')
    importer = GraphiteDashboardImporter(graphite, tessera)
    importer.dump_dashboards(query)

# =============================================================================
# json tasks
#  inv json.import
#  inv json.export
# =============================================================================

@task(name='export')
def export_json(c, dir, tag=None, graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    """
    Export dashboards as JSON to a local directory.
    """
    msg = 'Exporting dashboards (tagged: {0}) as JSON to directory {1}'
    log.info(msg.format(tag, dir))
    exporter = JsonExporter(graphite, tessera)
    exporter.export(dir, tag)

@task(name='import')
def import_json(c, pattern, graphite=DEFAULT_GRAPHITE_URL, tessera=DEFAULT_TESSERA_URL):
    """
    Import dashboards from a directory previously used for exporting.
    """
    log.info('Import dashboards from {0})'.format(pattern))
    files = glob.glob(pattern)
    log.info('Found {0} files to import'.format(len(files)))
    importer = JsonImporter(graphite, tessera)
    importer.import_files(files)

# =============================================================================
# test tasks
#  inv test.unit
#  inv test.integration
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


@task
def copy(c, source_id, source_uri=None, destination_uri=None):
    """
    Copy a dashboard (via API) between two running Tessera instances.

    :param str source_id:
        Source dashboard ID, e.g. if copying a dashboard that lives at
        ``http://mytessera.com/dashboards/123``, this would simply be ``123``.

    :param str source_uri:
        Source base URI, e.g. ``http://mytessera.com`` or
        ``https://tessera.example.com:8080``. Will pull default value from the
        ``TESSERA_SOURCE_URI`` environment variable if not given.

    :param str destination_uri:
        Destination base URI, similar to ``source_uri``. Will pull default
        value from ``TESSERA_DESTINATION_URI`` if not given.
    """
    # Arg handling junk
    missing = []
    if source_uri is None:
        try:
            source_uri = os.environ['TESSERA_SOURCE_URI']
        except KeyError:
            missing.append("source")
    if destination_uri is None:
        try:
            destination_uri = os.environ['TESSERA_DESTINATION_URI']
        except KeyError:
            missing.append("destination")
    if missing:
        sys.exit("Missing the following URI parameters: {0}".format(
                ', '.join("{0}_uri".format(x) for x in missing)))

    # Actual copy
    endpoint = '/api/dashboard/'
    source = reduce(urljoin, (source_uri, endpoint, source_id))
    try:
        original = requests.get(source, params={'definition': 'true'})
    except ConnectionError as e:
        sys.exit("Unable to connect to {0}: {1}".format(source, e))
    dest = urljoin(destination_uri, endpoint)
    try:
        response = requests.post(dest, data=original.content,
            headers={'Content-Type': 'application/json'})
    except ConnectionError as e:
        sys.exit("Unable to connect to {0}: {1}".format(dest, e))
    new_uri = urljoin(dest, response.json()['view_href'])
    print("{0} -> {1}".format(source, new_uri))


ns = Collection(
    run,
    copy,
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
