import requests
import logging
import json
import inflection
from cronenberg.model import *
from cronenberg.cask.storage import EntityEncoder

log = logging.getLogger(__name__)

class GraphiteDashboardImporter(object):
    def __init__(self, url, manager):
        self.url = url
        self.manager = manager

    def get_dashboard_names(self, query=''):
        response = requests.post('{0}/dashboard/find/'.format(self.url),
                                 params={'query':query})
        return [ d['name'] for d in response.json()['dashboards'] ]

    def get_dashboard(self, name):
        response = requests.get('{0}/dashboard/load/{1}'.format(self.url, name))
        return response.json()['state']

    def dump_dashboards(self, query):
        names = self.get_dashboard_names(query)
        print json.dumps([ self.get_dashboard(n) for n in names ], cls=EntityEncoder, indent=4)

    def import_dashboards(self, query):
        names = self.get_dashboard_names(query)
        log.info('Found {0} dashboards to import'.format(len(names)))
        log.info(','.join(names))

        for name in names:
            log.info('Importing {0}'.format(name))
            dash = self.import_dashboard(name)
            self.manager.store(Dashboard, dash)

    def import_dashboard(self, name):
        gd = self.get_dashboard(name)
        try:
            return self.__convert(gd)
        except Exception as e:
            print json.dumps(gd, cls=EntityEncoder, indent=4)
            raise e

    def __convert(self, gd):
        d = Dashboard(name=inflection.parameterize(gd['name']),
                      category='Graphite',
                      title=gd['name'],
                      description='Imported from graphite-web',
                      queries={},
                      grid=Grid())
        d.grid.rows = []
        row = Row()
        row.cells = []
        for g in gd['graphs']:
            presentation = None
            stacked_p = (g[2].find('stacked') != -1) or (g[1].get('areaMode', None) == 'stacked')
            query_name = 'q' + str(len(d.queries))
            targets = g[1]['target']
            d.queries[query_name] = targets[0] if len(targets) == 1 else targets
            if stacked_p:
                presentation = StackedAreaChart(query_name=query_name, title=g[1].get('title', ''))
            else:
                presentation = StandardTimeSeries(query_name=query_name, title=g[1].get('title', ''))
            presentation.options['yAxisFormat'] = ',.2s'
            presentation.height = 4
            if 'template' in g[1]:
                presentation.options['palette'] = g[1]['template']
            if 'vtitle' in g[1]:
                presentation.options['yAxisLabel'] = g[1]['vtitle']
                presentation.options['yAxisLabelDistance'] = 80
                presentation.options['yShowMaxMin'] = True
                presentation.options['margin'] = { 'top' : 0, 'left' : 80, 'right' : 0, 'bottom' : 16}
            row.cells.append(Cell(span=6, presentation=presentation))
            if len(row.cells) == 2:
                d.grid.rows.append(row)
                row = Row()
                row.cells = []
        return d
