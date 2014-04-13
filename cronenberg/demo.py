import json
import sys
from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
from .model import *

# =============================================================================
# Queries
# =============================================================================

# pushes sent
#  - total
#  - by type (regular vs. rich push)
#  - by platform
#  - TODO - actions (needs new fulfillment build)
#
# Total # of triggers processed & satisfied
#  - immediate
#  - historical
#
# End to End Delivery Time
#  - Mean
#  - 99th Percentile
#
# Pipelines API
#  - Mean latency
#  - 99th percentile latency

class Queries(object):
    def __init__(self, env):
        self.env = env

    def automation_end_to_end_delivery_time(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(max_series(rash(service, 'controller.pipeline_end_to_end_delivery_time.Mean')),
                           "End to End Delivery, Mean Latency"),
                     alias(max_series(rash(service, 'controller.pipeline_end_to_end_delivery_time.99thPercentile')),
                           "End to End Delivery, 99th% Latency"))

    def automation_push_payloads(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(sum_series(rash(service, 'pushpayloadmetrics.pushcount.all.Count')),
                           "All Push Count"),
                     alias(diff_series(sum_series(rash(service, 'pushpayloadmetrics.pushcount.all.Count')),
                                       sum_series(rash(service, 'pushpayloadmetrics.pushfeaturetype_richpush.payload.Count'))),
                           "Regular Push Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.pushfeaturetype_richpush.payload.Count')),
                           "Rich Push Count"))

    def automation_push_platform_rates(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_adm.platform.Count'))),
                           "ADM Rate"),
                     alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_android.platform.Count'))),
                           "Android Rate"),
                     alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_blackberry.platform.Count'))),
                           "Blackberry Rate"),
                     alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_ios.platform.Count'))),
                           "IOS Rate"),
                     alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_mpns.platform.Count'))),
                           "MPNS Rate"),
                     alias(sum_series(rate(rash(service, 'pushpayloadmetrics.audienceplatform_wns.platform.Count'))),
                           "WNS Rate"))

    def automation_push_platform_counts(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_adm.platform.Count')),
                           "ADM Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_android.platform.Count')),
                           "Android Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_blackberry.platform.Count')),
                           "Blackberry Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_ios.platform.Count')),
                           "IOS Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_mpns.platform.Count')),
                           "MPNS Count"),
                     alias(sum_series(rash(service, 'pushpayloadmetrics.audienceplatform_wns.platform.Count')),
                           "WNS Count"))

    def automation_api_rates(self):
        service = self.env.service('push-api')
        return group(alias(sum_series(rate(rash(service, 'pipelineendpointmetrics.total_request_count.Count'))),
                           "API Total Request Rate"),
                     alias(sum_series(non_negative_derivative(rash(service, 'pipelineendpointmetrics.total_request_count.Count'))),
                           "API Total Request Count"))

    def automation_api_latency(self):
        service = self.env.service('push-api')
        # TODO - the API should have a summary timer metric for /api/pipelines, but doesn't :(
        return alias(average_series(max_series(rash(service, 'pipelineendpointmetrics.postpipelinetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.postvalidatetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.putpipelinetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.deletepipelinetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.getpipelinetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.getlimitstimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.listpipelinetimer.Mean')),
                                    max_series(rash(service, 'pipelineendpointmetrics.listdeletedpipelinetimer.Mean'))),
                     "/api/pipelines, Average Latency")

    def automation_events(self):
        gorram  = self.env.service('triggers-gorram-consumer')
        ingress = self.env.service('triggers-state-ingress')
        return group(
            # Gorram - device events
            alias(sum_series(non_negative_derivative(rash(gorram, 'argonmutationconsumer_timer.device_open_processed.Count'))),
                  'Device Open Count'),
            alias(sum_series(rate(rash(gorram, 'argonmutationconsumer_timer.device_open_processed.Count'))),
                  'Device Open Rate'),
            # Ingress - tag events
            alias(sum_series(non_negative_derivative(rash(ingress, 'immediatetriggerauditlog.observation_latency.Count'))),
                  'Tag Observation Count'),
            alias(sum_series(rate(rash(ingress, 'immediatetriggerauditlog.observation_latency.Count'))),
                  'Tag Observation Rate'),
            # Gorram - all mutations
            alias(sum_series(non_negative_derivative(rash(gorram, 'argonmutationconsumer_meter.totalmutationsreceived.Count'))),
                  'Total Argon Mutation Count'),
            alias(sum_series(rate(rash(gorram, 'argonmutationconsumer_meter.totalmutationsreceived.Count'))),
                  'Total Argon Mutation Rate')

        )


    # =============================================================================
    # New queries for client-side processing

    def total_events_processed(self):
        gorram  = self.env.service('triggers-gorram-consumer')
        ingress = self.env.service('triggers-state-ingress')
        # Gorram - device events
        return alias(sum_series(non_negative_derivative(rash(gorram, 'argonmutationconsumer_timer.device_open_processed.Count')),
                                non_negative_derivative(rash(gorram, 'argonmutationconsumer_meter.totalmutationsreceived.Count')),
                                non_negative_derivative(rash(ingress, 'immediatetriggerauditlog.observation_latency.Count'))),
                     'Total Event Count')

    def total_triggers_processed(self):
        service = self.env.service('triggers-state-ingress')
        return alias(sum_series(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                                non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_processed.Count')))),
                     "Total Triggers Processed Count")

    def total_triggers_satisfied(self):
        service = self.env.service('triggers-state-ingress')
        return alias(sum_series(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                                non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_satisfied.Count')))),
                     "Total Triggers Satisfied Count")


    def total_pushes_sent(self):
        service = self.env.service('triggers-fulfillment')
        return alias(sum_series(non_negative_derivative(rash(service, 'pushfulfillmenthandler.total_push_count.Count')),
                                non_negative_derivative(rash(service, 'delayedpushfulfillmenthandler.total_delayed_push_count.Count'))),
                     "Push Count")

    def total_push_rate(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(sum_series(rate(rash(service, 'pushfulfillmenthandler.total_push_count.Count')),
                                      rate(rash(service, 'delayedpushfulfillmenthandler.total_delayed_push_count.Count'))),
                           "Total Push Rate"),
                     alias(sum_series(rate(rash(service, 'pushfulfillmenthandler.total_push_count.Count'))),
                           "Push Rate"),
                     alias(sum_series(rate(rash(service, 'delayedpushfulfillmenthandler.total_delayed_push_count.Count'))),
                           "Delayed Push Rate"))


    def immediate_triggers(self):
        service = self.env.service('triggers-state-ingress')
        return group(
            # Immediate
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_processed.Count'))),
                  "Immediate Triggers Processed Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_processed.Count'))),
                  "Immediate Triggers Processed Count"),
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_satisfied.Count'))),
                  "Immediate Triggers Satisfied Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_satisfied.Count'))),
                  "Immediate Triggers Satisfied Count"))


    def historical_triggers(self):
        service = self.env.service('triggers-state-ingress')
        return group(
            # Historial
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                  "Historical Triggers Processed Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                  "Historical Triggers Processed Count"),
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                  "Historical Triggers Satisfied Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                  "Historical Triggers Satisfied Count"))

    def device_event_rate(self):
        gorram  = self.env.service('triggers-gorram-consumer')
        return alias(sum_series(rate(rash(gorram, 'argonmutationconsumer_timer.device_open_processed.Count'))),
                     'Device Open Rate')

# =============================================================================

def demo_dashboard(env):
    q = Queries(env)
    graphite = env.graphite()

    dash = Dashboard(name='automation_overview',
                     category='Automation',
                     title='Overview',
                     queries = {
                         'total_events_processed'   : q.total_events_processed(),
                         'total_triggers_processed' : q.total_triggers_processed(),
                         'total_triggers_satisfied' : q.total_triggers_satisfied(),
                         'total_pushes_sent'        : q.total_pushes_sent(),
                         'total_push_rate'          : q.total_push_rate(),
                         'end_to_end'               : q.automation_end_to_end_delivery_time(),
                         'immediate_triggers'       : q.immediate_triggers(),
                         'historical_triggers'      : q.historical_triggers(),
                         'api_rate'                 : q.automation_api_rates(),
                         'api_latency'              : q.automation_api_latency(),
                         'device_event_rate'        : q.device_event_rate(),
                         'stacked_test' : q.automation_push_payloads()
                     },
                     grid=Grid(
                         Row(Cell(span=3, emphasize=True, align='center',
                                  presentation=SingleStat(title='Raw Events Processed',
                                                          query_name='total_events_processed',
                                                          decimal=0,
                                                          transform='sum')),
                             Cell(span=3, emphasize=True, align='center',
                                  presentation=SingleStat(title='Triggers Processed',
                                                          query_name='total_triggers_processed',
                                                          decimal=0,
                                                          transform='sum')),
                             Cell(span=3, emphasize=True, align='center',
                                  presentation=SingleStat(title='Triggers Satisifed',
                                                        query_name='total_triggers_satisfied',
                                                          decimal=0,
                                                          transform='sum')),
                             Cell(span=3, emphasize=True, align='center',
                                  presentation=SingleStat(title='Pushes Sent',
                                                          query_name='total_pushes_sent',
                                                          decimal=0,
                                                          transform='sum')))
                         ,Separator()
                         ,Row(Cell(span=4,
                                    presentation=JumbotronSingleStat(css_class='height4',
                                                                    title='Average Push Rate',
                                                                    query_name='total_push_rate',
                                                                    transform='mean',
                                                                    units=' /sec',
                                                                    decimal=3)),
                            Cell(span=8,
                                presentation=StandardTimeSeries(css_class='height4',
                                                                query_name='total_push_rate')))
#                         ,Row(Cell(span=2, offset=2,
#                                   presentation=SingleStat(title='Mean Push Rate',
#                                                           query_name='total_push_rate',
#                                                           units='/sec',
#                                                           decimal=3,
#                                                           transform='mean')),
#                              Cell(span=8, presentation=SimpleTimeSeries(query_name='total_push_rate')))
                         ,Row(Cell(span=2, offset=2,
                                  presentation=SingleStat(title='Mean End to End Delivery Time',
                                                          query_name='end_to_end',
                                                          units=' ms',
                                                          decimal=2,
                                                          transform='mean')),
                              Cell(span=8, presentation=SimpleTimeSeries(query_name='end_to_end')))
                         ,Separator()
                         ,Heading('Trigger Details')
                         ,Row(Cell(span=2,
                                   presentation=SingleStat(title='Immediate Triggers Processed',
                                                           query_name='immediate_triggers',
                                                           units='/sec',
                                                           decimal=2)),
                              Cell(span=2,
                                   presentation=SingleStat(title='Immediate Triggers Satisfied',
                                                           query_name='immediate_triggers',
                                                           units='/sec',
                                                           index=3,
                                                           decimal=2)),
                              Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='immediate_triggers')))
                         ,Row(Cell(span=2,
                                   presentation=SingleStat(title='Historical Triggers Processed',
                                                           query_name='historical_triggers',
                                                           units='/sec',
                                                           decimal=2)),
                              Cell(span=2,
                                   presentation=SingleStat(title='Historical Triggers Satisfied',
                                                           query_name='historical_triggers',
                                                           units='/sec',
                                                           index=3,
                                                           decimal=2)),
                              Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='historical_triggers')))
                         ,Row(Cell(span=2, offset=2,
                                   presentation=SingleStat(title='Mean Device Opens Rate',
                                                           query_name='device_event_rate',
                                                           units='/sec',
                                                           decimal=0)),
                              Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='device_event_rate')))
                         ,Separator()
                         ,Heading('API')
                         ,Row(Cell(span=2,
                                   presentation=SingleStat(title='Mean API Response Time',
                                                           query_name='api_latency',
                                                           units=' ms',
                                                           decimal=2)),
                              Cell(span=2,
                                   presentation=SingleStat(title='API Requests',
                                                           query_name='api_rate',
                                                           index=1,
                                                           decimal=0,
                                                           transform='sum')),
                              Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='api_rate')))
                         #,Row(Cell(span=8, offset=4,
                         #          presentation=StackedAreaChart(css_class='height4', query_name='gatekeeper')))
                     )
                 )
    #Row(Cell(span=12,
    #        presentation=StackedAreaChart(query_name='stacked_test')))
    return dash
