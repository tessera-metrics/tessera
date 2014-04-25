import json
import sys
from ..model import *
from ..model.database import *

margin = { 'top' : 12, 'bottom' : 20, 'left' : 40, 'right' : 20 }

def demo_gallery_dashboard():
    return database.Dashboard(
        title='Gallery',
        category='Demo',
        description='A gallery of all the supported presentations',
        tags=[ Tag('demo'), Tag('random'), Tag('featured')],
        definition = DashboardDef(
            definition=dumps(
                DashboardDefinition(
                    queries = {
                        'comparison' : 'aliasByNode(group(randomWalkFunction("today"), randomWalkFunction("yesterday")), 0)',
                        'positive' : 'aliasByNode(absolute(group(randomWalkFunction("system"),randomWalkFunction("user"),randomWalkFunction("wait"), randomWalkFunction("io"))), 0)',
                        'positive2' : 'aliasByNode(absolute(group(randomWalkFunction("cpu1"),randomWalkFunction("cpu2"),randomWalkFunction("cpu3"), randomWalkFunction("cpu4"), randomWalkFunction("cpu5"), randomWalkFunction("cpu6"), randomWalkFunction("cpu7"), randomWalkFunction("cpu8"))), 0)',
                        'multiple' : 'absolute(group(randomWalkFunction("a"),randomWalkFunction("b"),randomWalkFunction("c")))',
                        'single1' : 'absolute(randomWalkFunction("thing1"))',
                        'single2' : 'randomWalkFunction("thing2")'
                    },
                    items=[
                        Section(is_container=True,
                                 items=[
                                     #
                                     # Time Series Charts
                                     #

                                     Heading(text='Time Series Charts', description='A variety of time series charts rendered by nvd3'),
                                     Markdown(text="The [nvd3](http://nvd3.org/) javascript library provides an good set of standard, reusable charts "
                                              + "built on top of [d3](http://d3js.org/)."),
                                     Separator(),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Simple Time Series\n"
                                                             + "Use like a [sparkline](http://en.wikipedia.org/wiki/Sparkline), "
                                                            + "for displaying overall trends in a high level view.")),
                                         Cell(span=9,
                                              items=[ SimpleTimeSeries(query_name='single1'), SimpleTimeSeries(query_name='single1', title='Filled', filled=True) ])
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Standard Time Series\n"
                                                             + "Your basic multi-series line chart, with some nice interactive features.")),
                                         Cell(span=9,
                                              items=StandardTimeSeries(query_name='positive', options={
                                                  'margin' : margin,
                                                  'yAxisFormat' : ',.1s'
                                              }))
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Stacked Area\n"
                                                             + "Stacked graphs can be displayed in one of three modes, which can be switched interactively. "
                                                             + "Standard stacked series, [stream graphs](http://www.leebyron.com/else/streamgraph/), and "
                                                             + "a percentage view.")),
                                         Cell(span=9,
                                              items=[
                                                  StackedAreaChart(query_name='positive', options={
                                                      'margin' : margin,
                                                      'yAxisFormat' : ',.1s'
                                                  }),
                                                  Separator(),
                                                  StackedAreaChart(query_name='multiple', height=3, title='Stream Graph', options={
                                                      'style' : 'stream',
                                                      'margin' : margin,
                                                      'yAxisFormat' : ',.1s'
                                                  })])
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text='### Single Graph\n'
                                                             + 'Shamelessly stolen from [Tasseo](https://github.com/obfuscurity/tasseo).')),
                                         Cell(span=3,
                                              items=SingleGraph(height=1, query_name='single1')),
                                         Cell(span=3,
                                              items=SingleGraph(height=1, query_name='single2')),
                                         Cell(span=3,
                                              items=SingleGraph(height=1, query_name='multiple', index=2))
                                     ])
                                 ]),
                        Section(is_container=False,
                                css_class='bs-callout bs-callout-neutral',
                                items=[
                                    Heading(text='Breakout!', description="Items don't have to be confined to the fixed width grid"),
                                    Separator(),
                                    StackedAreaChart(query_name='positive2', height=5, options={
                                        'style' : 'stream',
                                        'margin' : margin,
                                        'yAxisFormat' : ',.1s'
                                    })
                                ]),
                        Section(is_container=True,
                                items=[

                                     #
                                     # Text Presentations
                                     #

                                    Separator(),
                                     Heading(text='Text Presentations', description='Various ways of calling out data'),
                                     Separator(),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Single Stats\n"
                                                             + "A single stat presentation shows one of the summation values that are "
                                                             + "calculated for each data series, along with a title and optionally units. ")),
                                         Cell(span=2,
                                              items=SingleStat(query_name='single1',
                                                               title='Sum, Left Justified',
                                                               transform='sum')),
                                         Cell(span=2, align='right',
                                              items=SingleStat(query_name='single1',
                                                               title='Min, Right Justified',
                                                               units='units',
                                                               transform='min')),
                                         Cell(span=2, align='center',
                                              items=SingleStat(query_name='single1',
                                                               title='Max, Centered',
                                                               format=',.0f',
                                                               units='/min',
                                                               transform='max'))
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Jumbotron Single Stat\n"
                                                             + "A larger single stat suitable for big displays")),
                                         Cell(span=5,
                                              items=JumbotronSingleStat(query_name='single1',
                                                                        height=3,
                                                                        format=',.2f',
                                                                        units='/sec',
                                                                        title='Hey this number is important',
                                                                        transform='sum'))
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Summation Tables\n"
                                                             + "Every data series returned from graphite has its min, max, sum, and mean "
                                                             + "values calculated. A summation table shows one or more of those values "
                                                             + "for each data series in the query." )),
                                         Cell(span=9,
                                              items=SummationTable(query_name='positive'))
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Markdown Text\nFor the inclusion of explanatory text and links. ")),
                                         Cell(span=4,
                                              items=Markdown(text='# Heading 1\n'
                                                             + '[Markdown](https://daringfireball.net/projects/markdown/) is a simple plain text format '
                                                             + 'for generating markup. It is rendered in a dashboard element by '
                                                             + '[markdown-js](https://github.com/evilstreak/markdown-js). \n'
                                                             + '## Heading 2\n'
                                                             + '* List \n'
                                                             + '* items \n'
                                                             + '* are supported \n'
                                                             + '## Heading 3\n'
                                                             + '``/* As is code */``, etc...')),
                                         Cell(span=5,
                                              items=Markdown(raw=True,
                                                             text='# Heading 1\n'
                                                             + '[Markdown](https://daringfireball.net/projects/markdown/) is a simple plain text format '
                                                             + 'for generating markup. It is rendered in a dashboard element by '
                                                             + '[markdown-js](https://github.com/evilstreak/markdown-js). \n'
                                                             + '## Heading 2\n'
                                                             + '* List \n'
                                                             + '* items \n'
                                                             + '* are supported \n'
                                                             + '## Heading 3\n'
                                                             + '``/* As is code */``, etc...'))
                                     ]),
                                     Separator(),
                                     Heading(text='Presentation Options', description='Some visual variations that can be applied to all presentations'),
                                     Separator(),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="Key metrics can be **emphasized** for attention in a variety of styles.")),
                                         Cell(span=3, style=DashboardItem.Style.WELL, align='center',
                                              items=SingleStat(query_name='single1',
                                                               title='Emphasized, Well',
                                                            transform='mean')),
                                         Cell(span=3, style=DashboardItem.Style.CALLOUT_NEUTRAL, align='center',
                                              items=SingleStat(query_name='single1',
                                                               title='Neutral Callout',
                                                               transform='mean')),
                                         Cell(span=3, style=DashboardItem.Style.CALLOUT_INFO, align='center',
                                              items=SingleStat(query_name='single1',
                                                               title='Information Callout',
                                                               transform='mean'))
                                     ]),
                                     Row(items=[
                                         Cell(span=3, offset=3, style=DashboardItem.Style.CALLOUT_SUCCESS, align='center',
                                              items=SingleStat(query_name='single1',
                                                               title='Success Callout',
                                                               transform='mean')),
                                         Cell(span=3,
                                              items=SingleStat(query_name='single2',
                                                               title='Warning Threshold',
                                                               transform='mean',
                                                               units='/sec',
                                                               format=',.2f',
                                                               css_class="ds-warning bs-callout bs-callout-warning")),
                                         Cell(span=3,
                                              items=SingleStat(query_name='single2',
                                                               title='Danger Threshold',
                                                               transform='max',
                                                               units='ms',
                                                               format=',.2f',
                                                               css_class="ds-danger bs-callout bs-callout-danger"))
                                     ]),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="Jumbotron singlestats with emphasis can get a lot of attention.")),
                                         Cell(span=5,style=DashboardItem.Style.CALLOUT_DANGER,
                                              items=JumbotronSingleStat(query_name='single1',
                                                                        height=2,
                                                                        format=',.2f',
                                                                        units='/sec',
                                                                        title='Hey, this looks really bad...',
                                                                        css_class='ds-danger',
                                                                        transform='sum'))
                                     ]),

                                     #
                                     # Other Charts
                                     #
                                     Separator(),
                                     Heading(text='Other Charts', description='Non-time series charts, also rendered by nvd3'),
                                     Separator(),
                                     Row(items=[
                                         Cell(span=3,
                                              items=Markdown(text="### Donuts & Pies\n"
                                                             + "Often abused, occasionally useful, always tasty!")),
                                         Cell(span=4,
                                              items=DonutChart(query_name='positive', height=3, title='Donut Chart', options={
                                                  'margin' : {
                                                      'top' : 0, 'left' : 0, 'bottom' : 12, 'right' : 0
                                                  }
                                              })),
                                         Cell(span=5,
                                              items=DonutChart(query_name='positive', title='Pie Chart', height=3, options={
                                                  'donut': False,
                                                  'labelType' : 'key',
                                                  'palette': 'applegreen'
                                              }))
                                     ])
                                 ])
                        ]))))
