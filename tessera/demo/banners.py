import json
import sys
from ..model import *
from ..model.database import *

def demo_carbon_dashboard():
    return database.Dashboard(
        title='Carbon for Index',
        category='Billboard',
        tags=[ Tag('demo'), Tag('carbon'), Tag('featured-billboard') ],
        definition = DashboardDef(
            definition=dumps(
                DashboardDefinition(
                     queries = {
                         'points' : 'group(carbon.agents.*.metricsReceived, carbon.agents.*.committedPoints)'
                     },
                     items=Section(items=[
                                       Row(items=[
                                           Cell(span=12, style=DashboardItem.Style.CALLOUT_INFO,
                                                 items=StandardTimeSeries(query='points',
                                                                          height=2,
                                                                          title='Inbound Metrics',
                                                                          options={
                                                                              'yAxisFormat' : ',.4s',
                                                                              'margin' : {
                                                                                  'top' : 0,
                                                                                  'bottom' : 16,
                                                                                  'right' : 0,
                                                                                  'left' : 60
                                                                              }
                                                                          }))
                                       ])
                     ])
                    )))
    )



def demo_yaw_sends_dashboard():
    return database.Dashboard(
        title='Delivery Tier (Yaw) for Index',
        category='Billboard',
        tags=[ Tag('demo'), Tag('delivery-tier'), Tag('yaw'), Tag('featured-billboard') ],
        definition = DashboardDef(
            definition=dumps(
                DashboardDefinition(
                     queries = {
                         'yaw_sends' : 'aliasByNode(stacked(scaleToSeconds(nonNegativeDerivative(servers.*.rash.yaw.*_queue.channel_write_time.Count),1)),1)'

                     },
                     items=Section(items=[
                                       Row(items=[
                                           Cell(span=12, style=DashboardItem.Style.WELL,
                                                 items=StackedAreaChart(query='yaw_sends',
                                                                          height=2,
                                                                          title='Yaw Sends per Second',
                                                                          options={
                                                                              'yAxisFormat' : ',.4s',
                                                                              'margin' : {
                                                                                  'top' : 0,
                                                                                  'bottom' : 16,
                                                                                  'right' : 0,
                                                                                  'left' : 60
                                                                              }
                                                                          }))
                                       ])
                     ])
                    )))
    )

def demo_bonestorm_sends_dashboard():
    return database.Dashboard(
        title='Delivery Tier (Bonestorm) for Index',
        category='Billboard',
        tags=[ Tag('demo'), Tag('delivery-tier'), Tag('bonestorm'), Tag('featured-billboard') ],
        definition = DashboardDef(
            definition=dumps(
                DashboardDefinition(
                     queries = {
                         'bonestorm_sends' : 'group(alias(scaleToSeconds(nonNegativeDerivative(sum(servers.*.rash.bonestorm.bsauditlog.sends.mpns.Count)),1),"MPNS"),alias(scaleToSeconds(nonNegativeDerivative(sum(servers.*.rash.bonestorm.bsauditlog.sends.wns.Count)),1),"WNS"),alias(scaleToSeconds(nonNegativeDerivative(sum(servers.*.rash.bonestorm.bsauditlog.sends.gcm.Count)),1),"GCM"))'

                     },
                     items=Section(items=[
                                       Row(items=[
                                           Cell(span=12, style=DashboardItem.Style.CALLOUT_NEUTRAL,
                                                 items=StackedAreaChart(query='bonestorm_sends',
                                                                          height=2,
                                                                          title='Bonestorm Sends per Second',
                                                                          options={
                                                                              'yAxisFormat' : ',.4s',
                                                                              'margin' : {
                                                                                  'top' : 0,
                                                                                  'bottom' : 16,
                                                                                  'right' : 0,
                                                                                  'left' : 60
                                                                              }
                                                                          }))
                                       ])
                     ])
                    )))
    )
