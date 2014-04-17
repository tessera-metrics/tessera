import json
import sys
from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
from ..model import *

def gallery_dashboard():
    return Dashboard(name='demo-gallery',
                     category='Demo',
                     title='Gallery',
                     queries = {
                         'comparison' : 'aliasByNode(group(randomWalkFunction("today"), randomWalkFunction("yesterday")), 0)',
                         'positive' : 'aliasByNode(absolute(group(randomWalkFunction("system"),randomWalkFunction("user"),randomWalkFunction("wait"), randomWalkFunction("io"))), 0)',
                         'multiple' : 'absolute(group(randomWalkFunction("a"),randomWalkFunction("b"),randomWalkFunction("c")))',
                         'single1' : 'randomWalkFunction("thing1")',
                         'single2' : 'randomWalkFunction("thing2")'
                     },
                     grid=Grid(
                         Heading(text='Time Series Charts', description='A variety of time series charts rendered by nvd3')
                         ,Separator()
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Simple Time Series"))
                              ,Cell(span=9,
                                    presentation=SimpleTimeSeries(query_name='single1')))
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Standard Time Series"))
                              ,Cell(span=9,
                                    presentation=StandardTimeSeries(query_name='positive')))
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Stacked Area"))
                              ,Cell(span=9,
                                    presentation=[
                                        StackedAreaChart(query_name='positive')
                                        ,Separator()
                                        ,StackedAreaChart(query_name='multiple', height=3, options={
                                            'style' : 'stream'
                                        })
                                    ]))
                         ,Heading(text='Other Charts', description='Non-time series charts, also rendered by nvd3')
                         ,Separator()
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Donuts & Pies"))
                              ,Cell(span=9,
                                    presentation=[
                                        DonutChart(query_name='positive', height=3, title='Donut Chart', options={
                                            'margin' : {
                                                'top' : 0, 'left' : 0, 'bottom' : 12, 'right' : 0
                                            }
                                        })
                                        ,Separator()
                                        ,DonutChart(query_name='positive', title='Pie Chart', height=3, options={
                                            'donut': False,
                                            'labelType' : 'key',
                                            'palette': 'applegreen'
                                        })
                                    ]))
                         ,Heading(text='Text Presentations', description='Various ways of calling out data')
                         ,Separator()
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Single Stats"))
                              ,Cell(span=2,
                                    presentation=SingleStat(query_name='single1',
                                                            title='Sum, Left Justified',
                                                            transform='sum'))
                              ,Cell(span=2, align='right',
                                    presentation=SingleStat(query_name='single1',
                                                            title='Min, Right Justified',
                                                            units='units',
                                                            transform='min'))
                              ,Cell(span=2, align='center',
                                    presentation=SingleStat(query_name='single1',
                                                            title='Max, Centered',
                                                            format=',.0f',
                                                            transform='max'))
                              ,Cell(span=3, emphasize=True, align='center',
                                    presentation=SingleStat(query_name='single1',
                                                            title='Mean, Emphasized',
                                                            transform='mean'))
                          )
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Jumbotron Single Stat\n"
                                                         + "A larger single stat suitable for big displays"))
                              ,Cell(span=6,
                                    presentation=JumbotronSingleStat(query_name='single1',
                                                                     height=3,
                                                                     units='/sec',
                                                                     title='Hey this number is important',
                                                                     transform='sum')))
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Summation Tables\n"
                                                         + "Every data series returned from graphite has its min, max, sum, and mean "
                                                         + "values calculated. A summation table shows one or more of those values "
                                                         + "for each data series in the query." ))
                              ,Cell(span=9,
                                    presentation=SummationTable(query_name='positive')))
                         ,Row(Cell(span=3,
                                   presentation=Markdown(text="### Markdown Text"))
                              ,Cell(span=9,
                                    presentation=Markdown(text='# Heading 1\n'
                                                          + '[Markdown](https://daringfireball.net/projects/markdown/) is a simple plain text format '
                                                          + 'for generating markup. It is rendered in a dashboard element by '
                                                          + '[markdown-js](https://github.com/evilstreak/markdown-js). \n'
                                                          + '## Heading 2\n'
                                                          + '* List \n'
                                                          + '* items \n'
                                                          + '* are supported \n'
                                                          + '## Heading 3\n'
                                                          + '``/* As is code */``, etc...')))
                     ))
