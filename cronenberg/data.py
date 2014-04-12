from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
import json
import sys

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
