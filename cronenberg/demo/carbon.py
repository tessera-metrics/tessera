import json
import sys
from ..model import *
from ..model.database import *

def demo_carbon_dashboard():
    return database.Dashboard(
        title='Carbon for Index',
        category='Demo',
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
