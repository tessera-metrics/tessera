import json
import logging
import inflection
from tessera_client.api.client import TesseraClient

log = logging.getLogger(__name__)

class JsonImporter(object):
    def __init__(self, graphite_url, tessera_url):
        self.graphite_url = graphite_url
        self.client = TesseraClient(tessera_url)

    def import_files(self, files):
        for f in files:
            self.import_file(f)

    def import_file(self, filepath):
        log.info('Importing from file {0}'.format(filepath))
        f = open(filepath, 'r')
        try:
            data = json.load(f)
            self.client.create_dashboard(data)
            log.info('Succesfully imported dashboard')
        finally:
            f.close()

class JsonExporter(object):
    def __init__(self, graphite_url, tessera_url):
        self.graphite_url = graphite_url
        self.client = TesseraClient(tessera_url)

    def export(self, directory, tag=None):
        dashboards = self.client.list_dashboards(tag=tag, definition=True)
        log.info('Found {0} dashboards to export to {1}'.format(len(dashboards), directory))
        for d in dashboards:
            self.export_dashboard(d, directory)

    def export_dashboard(self, dashboard, directory):
        filepath = '{0}/{1}.json'.format(directory, inflection.parameterize(dashboard.category + ' ' + dashboard.title))
        log.info('Exporting to {0}'.format(filepath))
        f = open(filepath, 'w')
        try:
            json.dump(dashboard, f, indent=2, cls=EntityEncoder)
        finally:
            f.close()
