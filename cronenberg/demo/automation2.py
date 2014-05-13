import json
import sys
from ..model import *
from ..model.database import *

queries = {
    'latency_overall'                 : 'groupByNode({{ua-service "triggers-fulfillment"}}.pushfulfillmenthandler.push_dispatch_time.*Percentile, 6, "maxSeries")',
    'latency_richpush_create'         : 'groupByNode({{ua-service "triggers-fulfillment"}}.pushdependencymetrics.createmessagelatency.richpush.*Percentile, 7, "maxSeries")',
    'latency_scheduled_overall'       : 'groupByNode({{ua-service "triggers-fulfillment"}}.delayedpushfulfillmenthandler.scheduled_push_dispatch_time.*Percentile, 6, "maxSeries")',
    'latency_kenneth'                 : 'groupByNode({{ua-service "triggers-fulfillment"}}.synchronouswithretriesclient_kenneth_client_get_violation_request_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_hangar'                  : 'groupByNode({{ua-service "triggers-fulfillment"}}.synchronouswithretriesclient_hangarrpcclient_store_request_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_meganome'                : 'groupByNode({{ua-service "triggers-fulfillment"}}.synchronouswithretriesclient_meganome_schedule_pushes_timer.request_duration.*Percentile, 6, "maxSeries")',
    'latency_gbc'                     : 'groupByNode({{ua-service "triggers-fulfillment"}}.synchronousgooeyclientimpl_timer.sendpushexecutiontime.*Percentile, 6, "maxSeries")',
    'latency_process_fulfillment_rpc' : 'groupByNode({{ua-service "triggers-fulfillment"}}.reactorrpcmetrics_timer.processfulfillmentscommandexecutiontime.*Percentile, 6, "maxSeries")',

    'timeouts_fulfillment_from_ingress' : 'alias(sumSeries(nonNegativeDerivative({{ua-service "triggers-state-ingress"}}.synchronouswithretriesclient_triggersfulfillmentclient_process_fulfillments_request_meter.timeout.Count)),"Fulfillment Timeouts")',

    # Push Counts
    'push_count_total'    : 'alias(nonNegativeDerivative(sumSeries({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.pushcount.all.Count)), "Total Push Count")',
    'push_count_plain'    : 'alias(nonNegativeDerivative(diffSeries(sumSeries({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.pushcount.all.Count),sumSeries({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.pushfeaturetype_richpush.payload.Count))), "Plain Push Count")',
    'push_count_richpush' : 'alias(nonNegativeDerivative(sumSeries({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.pushfeaturetype_richpush.payload.Count)), "Rich Push Count")',
    'push_platform' : 'aliasByNode(nonNegativeDerivative(groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.audienceplatform_*.platform.Count, 5, "sumSeries")),0)',


    # Push Payloads
    'payload_actions' : 'aliasByNode(nonNegativeDerivative(groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.actiontype_*.payload.Count, 5, "sumSeries")), 0)',
    'payload_richpush_size' : [ 'groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.richpushbodylength.payload.Mean, 7, "maxSeries")',
                                'groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.richpushbodylength.payload.75thPercentile, 7, "maxSeries")',
                                'groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.richpushbodylength.payload.95thPercentile, 7, "maxSeries")',
                                'groupByNode({{ua-service "triggers-fulfillment"}}.pushpayloadmetrics.richpushbodylength.payload.99thPercentile, 7, "maxSeries")' ]
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

def section_payload():
    section = Section(items=[Heading(text='Push Payloads'),
                             Separator(),
                             # payload_callout_row(),
                             Row(items=[
                                 Cell(span=3, align='right', items=SingleStat(title='Total Pushes', format=',.0f', transform='sum',
                                                                                        query='push_count_total')),
                                 Cell(span=9, items=StandardTimeSeries(title='Push Count (Total)',
                                                                       query='push_count_total'))
                             ]),
                             Row(items=[
                                 Cell(span=2, offset=1, align='right', items=SingleStat(title='Total Plain Pushes', format=',.0f', transform='sum',
                                                                                        query='push_count_plain')),
                                 Cell(span=9, items=StandardTimeSeries(title='Push Count (Plain)',
                                                                       query='push_count_plain'))
                             ]),
                             Row(items=[
                                 Cell(span=2, offset=1, align='right', items=SingleStat(title='Total Rich Pushes', format=',.0f', transform='sum',
                                                                                        query='push_count_richpush')),
                                 Cell(span=9, items=StandardTimeSeries(title='Push Count (Rich Push)',
                                                                       query='push_count_richpush'))
                             ])
#                             Row(items=[
#                                 Cell(span=9, offset=3, items=SummationTable(title='Distribution by Platform', query='push_platform'))
#                             ])
                             , Row(items=[
                                 Cell(span=9, offset=3, items=StackedAreaChart(height=3, title='Actions', query='payload_actions', options={"palette": "d3category10" }))
                             ])
                             , Row(items=[
                                 Cell(span=9, offset=3, items=StandardTimeSeries(height=3, title='Richpush Payload Size', query='payload_richpush_size', options={"yAxisFormat" : ',.2s', "palette": "d3category10" }))
                             ])


                         ])
    return section



def payload_callout_row():
    return Row(items=[
        Cell(span=3, style='well', align='center', items=SingleStat(title='Plain Pushes', format=',.0f', transform='sum', query='push_count_plain')),
        Cell(span=3, style='well', align='center', items=SingleStat(title='Rich Pushes', format=',.0f', transform='sum', query='push_count_richpush')),
        Cell(span=3, style='well', align='center', items=SingleStat(title='Android', format=',.0f', transform='sum', query='push_platform', index=2)),
        Cell(span=3, style='well', align='center', items=SingleStat(title='iOS', format=',.0f', transform='sum', query='push_platform', index=4))
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
                        section_payload(),
                        section_errors(),
                        section_fulfillment_rpc_latency(),
                        section_fulfillment_dependencies_latency()
                    ]
                ))))
