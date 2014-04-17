import json
import sys
from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
from ..model import *

def demo_random_data_dashboard():
    return Dashboard(name='demo-random-data',
                     category='Demo',
                     title='Random Data',
                     queries = {
                         'cpu_usage' : 'absolute(group(randomWalkFunction("system"),randomWalkFunction("user"),randomWalkFunction("wait")))',
                         'cluster' : 'aliasByNode(absolute(group(randomWalkFunction("s001"),randomWalkFunction("s002"),randomWalkFunction("s003"),randomWalkFunction("s004"),randomWalkFunction("s005"))), 0)',
                         'thing1' : 'randomWalkFunction(thing1)',
                         'thing2' : 'randomWalkFunction(thing2)',
                         'thing3' : 'randomWalkFunction(thing3)',
                         'thing4' : 'randomWalkFunction(thing4)'
                     },
                     grid=Grid(
                         Heading(text='A Heading',
                                 description='Followed by a separator')
                         ,Separator()
                         ,Row(
                             Cell(span=4,
                                  presentation=[
                                      JumbotronSingleStat(title='Jumbotron Singlestat',
                                                        query_name='cpu_usage',
                                                          units='frobs')
                                  ])
                             ,Cell(span=8, emphasize=True,
                                   presentation=StackedAreaChart(query_name='cpu_usage', height=3, title="stacked_area_chart"))
                         )
                         ,Row(
                             Cell(span=2,offset=4,align='right', emphasize=True,
                                  presentation=SingleStat(title='Max. Frob Density',
                                                 query_name='cpu_usage',
                                                 transform='max',
                                                 units='frobs/kg',
                                                 format=',.0f'))
                             ,Cell(span=2,align='center',emphasize=True,
                                   presentation=SingleStat(title='Average Rate',
                                                           query_name='cpu_usage',
                                                           transform='mean',
                                                        units='/sec',
                                                           format=',.2f'))

                             ,Cell(span=4, emphasize=True,align='center',
                                   presentation=SingleStat(title='Total Frobs',
                                                           query_name='cpu_usage',
                                                           transform='sum',
                                                           units='frobs',
                                                        format=',.0f'))
                         )
                         ,Heading(text="Cluster Health",
                                  description="Very Important Metrics for Determining Things and Stuff",
                                  level=2)
                         ,Separator()
                         ,Row(Cell(span=12,
                                   presentation=StandardTimeSeries(height=4,
                                                                   query_name='cluster',
                                                                   options={
                                                                       'yAxisLabel' : 'frobs per second',
                                                                       'margin' : {
                                                                           'top' : 0, 'bottom' : 16, 'right' : 0, 'left' : 80
                                                                    }
                                                                   })))

                         ,Row(
                             Cell(span=4,
                                  presentation=Markdown(text="### An Explanatory Box\n\n"
                                                        + "Containing text in [Markdown](https://daringfireball.net/projects/markdown/) format. "
                                                        + "You can use this to include explanatory text about your metrics. The table to the right "
                                                        + "is a ``summation_table`` presentation linked to the same query as the "
                                                        + "``standard_time_series`` presentation displayed above."))
                             ,Cell(span=4,
                                   presentation=SummationTable(query_name='cluster',
                                                               format=',.4f'))
                             ,Cell(span=4,
                                   presentation=DonutChart(title='Distribution of Frobs',
                                                           query_name='cluster'))
                         )
                         ,Heading(text="Summaries")
                         ,Separator()
                         ,Row(
                             Cell(span=2,
                                  presentation=SingleStat(title='Max', transform='max', format=',.1f', units='things', query_name='thing1'))
                             ,Cell(span=2,
                                   presentation=SingleStat(title='Average', transform='mean', format=',.1f', units='things', query_name='thing1'))
                             ,Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='thing1'))
                         )
                         ,Row(
                             Cell(span=2,
                                  presentation=SingleStat(title='Max', transform='max', format=',.1f', units='things', query_name='thing2'))
                             ,Cell(span=2,
                                   presentation=SingleStat(title='Average', transform='mean', format=',.1f', units='things', query_name='thing2'))
                             ,Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='thing2'))
                         )
                         ,Row(
                             Cell(span=2,
                                  presentation=SingleStat(title='Max', transform='max', format=',.1f', units='things', query_name='thing3'))
                             ,Cell(span=2,
                                   presentation=SingleStat(title='Average', transform='mean', format=',.1f', units='things', query_name='thing3'))
                             ,Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='thing3'))
                         )
                         ,Row(
                             Cell(span=2,
                                  presentation=SingleStat(title='Max', transform='max', format=',.1f', units='things', query_name='thing4'))
                             ,Cell(span=2,
                                   presentation=SingleStat(title='Average', transform='mean', format=',.1f', units='things', query_name='thing4'))
                             ,Cell(span=8,
                                   presentation=SimpleTimeSeries(query_name='thing4'))
                         )
                     )
                 )
