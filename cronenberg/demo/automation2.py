import json
import sys
from ..model import *
from ..model.database import *

queries = {
    'latency_overall'                 : 'groupByNode(servers.*.rash.triggers-fulfillment.pushfulfillmenthandler.push_dispatch_time.*Percentile, 6, "maxSeries")',
    'latency_richpush_create'         : 'groupByNode(servers.*.rash.triggers-fulfillment.pushdependencymetrics.createmessagelatency.richpush.*Percentile, 7, "maxSeries")',
    'latency_scheduled_overall'       : 'groupByNode(servers.*.rash.triggers-fulfillment.delayedpushfulfillmenthandler.scheduled_push_dispatch_time.*Percentile, 6, "maxSeries")',
    'latency_kenneth'                 : 'groupByNode(servers.*.rash.triggers-fulfillment.synchronouswithretriesclient_kenneth_client_get_violation_request_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_hangar'                  : 'groupByNode(servers.*.rash.triggers-fulfillment.synchronouswithretriesclient_hangarrpcclient_store_request_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_meganome'                : 'groupByNode(servers.*.rash.triggers-fulfillment.synchronouswithretriesclient_meganome_schedule_pushes_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_gbc'                     : 'groupByNode(servers.*.rash.triggers-fulfillment.synchronousgooeyclientimpl_timer.sendpushexecutiontime.*Percentile, 6, "maxSeries")',
    'latency_process_fulfillment_rpc' : 'groupByNode(servers.*.rash.triggers-fulfillment.reactorrpcmetrics_timer.processfulfillmentscommandexecutiontime.*Percentile, 6, "maxSeries")',

    'timeouts_fulfillment_from_ingress' : 'alias(sumSeries(nonNegativeDerivative(servers.*.rash.triggers-state-ingress.synchronouswithretriesclient_triggersfulfillmentclient_process_fulfillments_request_meter.timeout.Count)),"Fulfillment Timeouts")'
}




def time_series_row(pair, type='Latency'):
    if isinstance(pair, list):
        return [time_series_row(p) for p in pair]
    return Row(items=[
        Cell(span=3, align='right', items=[
            SingleStat(title='Mean ' + type, query=pair[1], transform='mean', units='ms', format=',.1f'),
            SingleStat(title='Max ' + type, query=pair[1], transform='max', units='ms', format=',.1f')
        ]),
        Cell(span=9, items=StandardTimeSeries(title=pair[0], query=pair[1]))
    ])

def section_errors():
    section = Section(items=[Heading(text='Errors'),
                             Separator(),
                             Row(items=[
                                 Cell(span=2, offset=1, align='right', items=SingleStat(title='Total Timeouts', format=',.1s', transform='sum',
                                                                                        query='timeouts_fulfillment_from_ingress',
                                                                                        thresholds=Thresholds(warning=1, danger=10))),
                                 Cell(span=9, items=StandardTimeSeries(title='Fulfillment RPC Timeouts (reported from triggers-state-ingress)',
                                                                       query='timeouts_fulfillment_from_ingress',
                                                                       thresholds=Thresholds(warning=1, danger=10)))
                             ])
                             ])
    return section


def section_fulfillment_dependencies_latency():
    entries = [
        ('Gooeybuttercake Latency', 'latency_gbc'),
        ('Richpush Create Latency', 'latency_richpush_create'),
        ('Meganome Latency', 'latency_meganome'),
        ('Kenneth Latency', 'latency_kenneth'),
        ('Hangar Latency', 'latency_hangar'),
    ]
    section = Section(items=[Heading(text='Fulfillment Dependencies Latency', description="Latencies for the triggers-fulfillment service's dependencies"),
                             Separator()])
    section.items.extend(time_series_row(entries))
    return section

def section_fulfillment_rpc_latency():
    entries = [
        ('Process Fulfillment RPC Batch Latency', 'latency_process_fulfillment_rpc'),
        ('Immediate Push Individual Latency', 'latency_overall'),
        ('Scheduled Push Individual Latency', 'latency_scheduled_overall')
    ]
    section = Section(items=[Heading(text='Fulfillment RPC Latency', description='Response time for the triggers-fulfillment services process fulfillments command'),
                             Separator()])
    section.items.extend(time_series_row(entries))
    return section

def demo_automation_2():
    return database.Dashboard(
        title='Detailed Overview',
        category='Automation',
        summary='Data. Lots and lots of data',
        tags=[ Tag('automation'), Tag('featured') ],
        definition=DashboardDef(
            definition=dumps(
                DashboardDefinition(
                    queries=queries,
                    items=[
                        section_errors(),
                        section_fulfillment_rpc_latency(),
                        section_fulfillment_dependencies_latency()
                    ]
                ))))
