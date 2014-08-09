import requests
import logging
import json
import inflection
import urllib
from tessera_client.api.model import *
from tessera_client.api.client import TesseraClient

log = logging.getLogger(__name__)

class GraphiteDashboardImporter(object):
    def __init__(self, graphite_url, tessera_url):
        self.graphite_url = graphite_url
        self.client = TesseraClient(tessera_url)

    def get_dashboard_names(self, query=''):
        response = requests.post('{0}/dashboard/find/'.format(self.graphite_url),
                                 params={'query':query})
        return [ d['name'] for d in response.json()['dashboards'] ]

    def get_dashboard(self, name):
        response = requests.get('{0}/dashboard/load/{1}'.format(self.graphite_url, name))
        return response.json()['state']

    def dump_dashboards(self, query):
        names = self.get_dashboard_names(query)
        print(json.dumps([ self.get_dashboard(n) for n in names ], cls=EntityEncoder, indent=4))

    def import_dashboards(self, query, overwrite=False, **kwargs):
        names = self.get_dashboard_names(query)
        log.info('Found {0} dashboards to import'.format(len(names)))
        log.info(','.join(names))

        imported = 0
        skipped = 0
        updated = 0

        for name in names:
            href  = self.__graphite_href(name)
            found = self.client.list_dashboards(imported_from=href, definition=True)
            dashboard = found[0] if len(found) > 0 else None
            if dashboard and (not overwrite):
                log.info('Skipping {0}'.format(name))
                skipped += 1
                continue
            elif dashboard and overwrite:
                log.info('Updating {0}'.format(name))
                updated += 1
            else:
                log.info('Importing {0}'.format(name))
                imported += 1
            dash = self.import_dashboard(name, dash=dashboard, **kwargs)

            if dashboard:
                self.client.update_dashboard(dash)
            else:
                self.client.create_dashboard(dash)

        log.info('Imported {0} new dashboards; updated {1}; skipped {2}'.format(imported, updated, skipped))

    def __graphite_href(self, name):
        return '{0}/dashboard/#{1}'.format(self.graphite_url, urllib.quote(name))

    def import_dashboard(self, name, **kwargs):
        return self.__convert(self.get_dashboard(name), **kwargs)

    def __convert(self, graphite_dashboard, dash=None, layout=Section.Layout.FIXED, columns=2, overwrite=False):
        span = 12 / columns
        name = graphite_dashboard['name']
        dashboard = dash
        if dashboard is None:
            dashboard = Dashboard(title=inflection.parameterize(name),
                                  category='Graphite',
                                  tags=['imported'],
                                  imported_from=self.__graphite_href(name))
        definition = DashboardDefinition()
        section = Section(layout=layout)
        definition.items.append(section)

        # if 'defaultGraphParams' in graphite_dashboard:
        #     default_width = graphite_dashboard['defaultGraphParams'].get('width', None)
        #     print graphite_dashboard['defaultGraphParams']
        #     if default_width and default_width > 800:
        #         num_columns = 1
        #         span = 12

        graph_count = 0
        row = Row()
        for graph in graphite_dashboard['graphs']:
            # Graphite's dashboard API is so redundant. Each graph is
            # a 3-element array:
            # [
            #    target string,
            #    options dict (which contains the targets array too),
            #    render URL string
            #  ]
            targets, options, render_url = graph
            presentation = None
            stacked_p = (render_url.find('stacked')) != -1 or (options.get('areaMode', None) == 'stacked')
            query = 'q' + str(len(definition.queries))
            targets = options.get('target', [])
            definition.queries[query] = targets[0] if len(targets) == 1 else targets
            if stacked_p:
                presentation = StackedAreaChart(query=query, title=options.get('title', ''))
            else:
                presentation = StandardTimeSeries(query=query, title=options.get('title', ''))
            presentation.options['yAxisFormat'] = ',.2s'
            presentation.height = 4
            if 'template' in options:
                presentation.options['palette'] = options['template']
            if 'vtitle' in options:
                presentation.options['yAxisLabel'] = options['vtitle']
                presentation.options['yShowMaxMin'] = True
            presentation.options['margin'] = { 'top' : 16, 'left' : 80, 'right' : 0, 'bottom' : 16 }

            row.items.append(Cell(span=span, items=presentation))
            graph_count += 1
            if len(row.items) == columns:
                section.items.append(row)
                row = Row()

        if len(row.items) > 0:
            section.items.append(row)

        if graph_count == 0:
            log.warn('Failed to convert any graphs for dashboard {0}'.format(name))

        dashboard.definition = definition
        return dashboard
