import json
import sys
from ..model import *
from ..model.database import *

def demo_node_dashboard():
    return database.Dashboard(
        title='System Overview for {{#if title}}{{title}}{{else}}{{ node }}{{/if}}',
        category='Demo',
        definition = DashboardDef(
            definition=dumps(
                DashboardDefinition(
                     queries = {
                         'cpu_usage' : 'aliasByNode(group(servers.{{ node }}.sysstat.cpu.all.system,servers.{{ node }}.sysstat.cpu.all.user,servers.{{ node }}.sysstat.cpu.all.io_wait), 1, 5)',
                         'loadavg' : 'aliasByNode(servers.{{ node }}.sysstat.loadavg.01, 1)',
                         'context' : 'aliasByNode(servers.{{ node }}.sysstat.context_switches.context_switches, 1)',
                         'processes' : 'aliasByNode(servers.{{ node }}.sysstat.loadavg.process_list_size, 1)',
                         'bytes_received' : 'aliasByNode(servers.{{ node }}.sysstat.network.*.bytes_rx,1,4)',
                         'tcp_establised' : 'aliasByNode(servers.{{ node }}.tcp.CurrEstab,1)',
                         'memory_usage' : 'aliasByNode(asPercent(sumSeries(servers.{{ node }}.memory.Active),sumSeries(servers.{{ node }}.memory.MemTotal)),1)',
                         'chef' : 'drawAsInfinite(servers.{{node}}.chef.elapsed)'
                     },
                     grid=Grid(
                         Row(
                             Cell(span=4, style=DashboardItem.Style.WELL,
                                  presentation=StandardTimeSeries(height=2, title='Load Average', query_name='loadavg'))
                             ,Cell(span=4, style=DashboardItem.Style.WELL,
                                   presentation=StandardTimeSeries(height=2, title='TCP Connections', query_name='tcp_establised'))
                             ,Cell(span=4, style=DashboardItem.Style.WELL,
                                   presentation=StandardTimeSeries(height=2, title='% Memory In Use', query_name='memory_usage'))
                         )
 #                        ,Row(Cell(span=2, offset=2, align='right', presentation=SingleStat(title='Cheffed', query_name='chef', transform='sum', units='times', format=',.0f'))
 #                             ,Cell(span=8, presentation=SimpleTimeSeries(query_name='chef')))
                         ,Heading('CPU')
                         ,Separator()
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='cpu_usage', title='Max Usage', transform='max'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='cpu_usage', title='Mean Usage', transform='mean'))
                              ,Cell(span=8,
                                    presentation=StackedAreaChart(title='CPU Usage',query_name='cpu_usage', options={
                                        'yAxisFormat': ',.0f',
                                        'palette' : 'd3category10'
                                    }))
                              )
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='loadavg', title='Max Load Average', transform='max'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='loadavg', title='Mean Load Average', transform='mean'))
                              ,Cell(span=8,
                                    presentation=StandardTimeSeries(title='1 Minute Load Average',query_name='loadavg')))
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='context', title='Max Context Switches',
                                                                                   transform='max', units='/sec',
                                                                                   format=',.2s'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='context', title='Mean Context Switches',
                                                                                    transform='mean', units='/sec',
                                                                                    format=',.2s'))
                              ,Cell(span=8,
                                    presentation=StandardTimeSeries(title='Context Switches per Second',query_name='context', options={
                                        'yAxisLabel' : 'Context Switches per Second',
                                        'yAxisFormat' : ',.2s'
                                    })))
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='processes', title='Max Processes',
                                                                                   transform='max',
                                                                                   format=',.0f'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='processes', title='Mean Processes',
                                                                                    transform='mean',
                                                                                    format=',.0f'))
                              ,Cell(span=8,
                                    presentation=StandardTimeSeries(title='Active Processes',query_name='processes', options={
                                        'yAxisLabel' : 'Total # of Processes',
                                        'yAxisFormat' : ',.0f'
                                    })))

                         ,Heading('Network')
                         ,Separator()
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='tcp_establised', title='Max Connections',
                                                                                   transform='max',
                                                                                   thresholds=Thresholds(warning=28000, danger=30000),
                                                                                   format=',.2s'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='tcp_establised', title='Mean Connections',
                                                                                    transform='mean',
                                                                                    format=',.2s'))
                              ,Cell(span=8, height=3,
                                    presentation=StandardTimeSeries(title='TCP Connections Established',query_name='tcp_establised', options={
                                        # 'yAxisLabel' : '# of Bytes/Second',
                                        'yAxisFormat' : ',.2s'
                                    })))
                         ,Row(Cell(span=2, align='center', presentation=SingleStat(query_name='bytes_received', title='Max',
                                                                                   transform='max',
                                                                                   units='/sec',
                                                                                   format=',.1s'))
                              ,Cell(span=2, align='center', presentation=SingleStat(query_name='bytes_received', title='Sum',
                                                                                    transform='sum',
                                                                                    units='bytes',
                                                                                    format=',.1s'))
                              ,Cell(span=8,
                                    presentation=StackedAreaChart(title='Bytes Received',query_name='bytes_received', height=3,
                                                                  options={
                                                                      'yAxisLabel' : '# of Bytes/Second',
                                                                      'yAxisFormat' : ',.1s',
                                                                      'style' : 'stream'
                                                                  })))

                     ))
                )))
