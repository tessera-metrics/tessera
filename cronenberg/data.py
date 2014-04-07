from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
import json
import sys

class Datastore(object):
    def __init__(self, env):
        self.env = env
        self.graphite = env.graphite()

    def fetch(self, target, from_time='-12h', until_time=None):
        """
        Retrieve a set of metrics in JSON format and process them for
        display.
        """
        query = GraphiteQuery(target, format=Graphite.Format.JSON, from_time=from_time, until_time=until_time)
        response = self.graphite.fetch(query)
        return self.process(response.json())

    def process(self, data, reverse_points=True):
        """
        Take raw JSON data from Graphite and transform it into something
        suitable for the presentation layer (i.e. flot).
        """
        for series in data:
            self.__process_series(series)
        return data

    def __process_series(self, series):
        datapoints = series['datapoints']

        series['label'] = series['target']
        del series['datapoints']
        del series['target']

        min_value = sys.maxint
        max_value = 0
        sum_value = 0
        last_value = 0

        transformed_datapoints = []
        for point in datapoints:
            value, timestamp = point
            value = value if value else 0

            point[0] = timestamp
            point[1] = value

            transformed_datapoints.append({ "x": timestamp, "y": value })

            last_value = value
            sum_value += value
            if value > max_value:
                max_value = value
            if value < min_value:
                min_value = value

        series['sum']  = sum_value
        series['avg']  = sum_value / len(datapoints) if len(datapoints) > 0 else 0
        series['min']  = min_value
        series['max']  = max_value
        series['last'] = last_value

        series['values'] = transformed_datapoints
        return series

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

    def automation_total_pushes(self):
        service = self.env.service('triggers-fulfillment')
        return group(alias(sum_series(non_negative_derivative(rash(service, 'pushfulfillmenthandler.total_push_count.Count')),
                                      non_negative_derivative(rash(service, 'delayedpushfulfillmenthandler.total_delayed_push_count.Count'))),
                           "Push Count"),
                     alias(sum_series(rate(rash(service, 'pushfulfillmenthandler.total_push_count.Count')),
                                      rate(rash(service, 'delayedpushfulfillmenthandler.total_delayed_push_count.Count'))),
                           "Push Rate"))

    def automation_triggers_processed(self):
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
                  "Immediate Triggers Satisfied Count"),

            # Historial
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                  "Historical Triggers Processed Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                  "Historical Triggers Processed Count"),
            alias(rate(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                  "Historical Triggers Satisfied Rate"),
            alias(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                  "Historical Triggers Satisfied Count"),

            # Total
            alias(sum_series(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_processed.Count'))),
                             non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_processed.Count')))),
                  "Total Triggers Processed Count"),
            alias(sum_series(non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.historical_triggers_satisfied.Count'))),
                             non_negative_derivative(sum_series(rash(service, 'observationstreamconsumer.immediate_triggers_satisfied.Count')))),
                  "Total Triggers Satisfied Count")
        )

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
        return group(
                     # TODO - the API should have a summary timer metric for /api/pipelines, but doesn't :(
                     alias(average_series(max_series(rash(service, 'pipelineendpointmetrics.postpipelinetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.postvalidatetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.putpipelinetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.deletepipelinetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.getpipelinetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.getlimitstimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.listpipelinetimer.Mean')),
                                          max_series(rash(service, 'pipelineendpointmetrics.listdeletedpipelinetimer.Mean'))),
                           "/api/pipelines, Average Latency"))

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
