import requests
import logging
import json
import inflection
import urllib
from cronenberg.model import *
from cronenberg.cask.storage import EntityEncoder
from cronenberg import app

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
        return self.__convert(self.get_dashboard(name))

    def __convert(self, graphite_dashboard):
        name = graphite_dashboard['name']
        dashboard = Dashboard(name=inflection.parameterize(name),
                              title=name,
                              category='Graphite',
                              description='Imported from graphite-web',
                              imported_from = '{0}/dashboard/{1}'.format(app.config['GRAPHITE_URL'], urllib.quote(name)))
        row = Row()
        for graph in graphite_dashboard['graphs']:
            # Graphite's dashboard API is so redundant. Each graph is
            # a 3-element array:
            # [
            #    targets array,
            #    options dict (which contains the targets array too),
            #    render URL string
            #  ]
            targets, options, render_url = graph
            presentation = None
            stacked_p = render_url.find('stacked') != -1 or options.get('areaMode', None) == 'stacked'
            query_name = 'q' + str(len(dashboard.queries))
            targets = options.get('target', [])
            dashboard.queries[query_name] = targets[0] if len(targets) == 1 else targets
            if stacked_p:
                presentation = StackedAreaChart(query_name=query_name, title=options.get('title', ''))
            else:
                presentation = StandardTimeSeries(query_name=query_name, title=options.get('title', ''))
            presentation.options['yAxisFormat'] = ',.2s'
            presentation.height = 4
            if 'template' in options:
                presentation.options['palette'] = options['template']
            if 'vtitle' in options:
                presentation.options['yAxisLabel'] = options['vtitle']
                presentation.options['yShowMaxMin'] = True
            presentation.options['margin'] = { 'top' : 16, 'left' : 80, 'right' : 0, 'bottom' : 16}
            row.cells.append(Cell(span=6, presentation=presentation))
            if len(row.cells) == 2:
                dashboard.grid.rows.append(row)
                row = Row()
                row.cells = []
        return dashboard
