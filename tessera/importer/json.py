import json
import logging
import inflection
from tessera.model import *
from tessera import app, db

log = logging.getLogger(__name__)
mgr = database.DatabaseManager(db)

class JsonImporter(object):

    @staticmethod
    def import_files(files):
        for f in files:
            JsonImporter.import_file(f)

    @staticmethod
    def import_file(filepath):
        log.info('Importing from file {0}'.format(filepath))
        f = open(filepath, 'r')
        try:
            data = json.load(f)
            # This is basically the same as api_dashboard_create() in
            # views.py; could consolidate the two in DatabaseManager
            dashboard = database.Dashboard.from_json(data)
            if 'definition' in data:
                dashboard.definition = database.DashboardDef(dumps(data['definition']))
            else:
                dashboard.definition = database.DashboardDef(dumps(DashboardDefinition()))
            mgr.store_dashboard(dashboard)
            log.info('Succesfully imported dashboard {0}: {1}'.format(dashboard.id, dashboard.title))
        finally:
            f.close()

class JsonExporter(object):
    @staticmethod
    def export(directory, tag=None):
        tag = database.Tag.query.filter_by(name=tag).first()
        if not tag:
            dashboards = [d for d in database.Dashboard.query.all()]
        else:
            dashboards = [d for d in tag.dashboards]
        log.info('Found {0} dashboards to export to {1}'.format(len(dashboards), directory))
        for d in dashboards:
            JsonExporter.export_dashboard(d, directory)

    @staticmethod
    def export_dashboard(dashboard, directory):
        dash = dashboard.to_json()
        dash['definition'] = json.loads(dashboard.definition.definition)
        filepath = '{0}/{1}.json'.format(directory, inflection.parameterize(dashboard.category + ' ' + dashboard.title))
        log.info('Exporting to {0}'.format(filepath))
        f = open(filepath, 'w')
        try:
            json.dump(dash, f, indent=2, cls=web.EntityEncoder)
        finally:
            f.close()
