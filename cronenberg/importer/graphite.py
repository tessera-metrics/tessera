import requests
import logging
import json
import inflection
import urllib
from cronenberg.model import *
from cronenberg import app, db

log = logging.getLogger(__name__)
mgr = database.DatabaseManager(db)

class GraphiteDashboardImporter(object):
    def __init__(self, url):
        self.url = url

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

    def import_dashboards(self, query, **kwargs):
        names = self.get_dashboard_names(query)
        log.info('Found {0} dashboards to import'.format(len(names)))
        log.info(','.join(names))

        for name in names:
            log.info('Importing {0}'.format(name))
            dash = self.import_dashboard(name, **kwargs)
            mgr.store_dashboard(dash)

    def import_dashboard(self, name, **kwargs):
        return self.__convert(self.get_dashboard(name), **kwargs)

    def __convert(self, graphite_dashboard, fluid=False, columns=2):
        span = 12 / columns
        name = graphite_dashboard['name']
        dashboard = database.Dashboard(title=inflection.parameterize(name),
                                       category='Graphite',
                                       tags=[database.Tag('imported'), database.Tag('from:graphite-web')],
                                       imported_from = '{0}/dashboard/{1}'.format(app.config['GRAPHITE_URL'], urllib.quote(name)))
        definition = DashboardDefinition()
        section = Section(is_container=not fluid)
        definition.items.append(section)

        # if 'defaultGraphParams' in graphite_dashboard:
        #     default_width = graphite_dashboard['defaultGraphParams'].get('width', None)
        #     print graphite_dashboard['defaultGraphParams']
        #     if default_width and default_width > 800:
        #         num_columns = 1
        #         span = 12

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
            query_name = 'q' + str(len(definition.queries))
            targets = options.get('target', [])
            definition.queries[query_name] = targets[0] if len(targets) == 1 else targets
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

            row.items.append(Cell(span=span, items=presentation))
            if len(row.items) == columns:
                section.items.append(row)
                row = Row()

        dashboard.definition = database.DashboardDef(definition=dumps(definition))
        return dashboard
