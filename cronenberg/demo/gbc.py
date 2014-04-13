import json
import sys
from toolbox.graphite.functions import *
from toolbox.graphite import Graphite, GraphiteQuery
from ..model import *

def gbc_demo_dashboard():
    return Dashboard(name='gbc_demo',
                     category='Gooeybuttercake',
                     title='System Overview',
                     queries = {
                         'cpu' : "group(aliasByNode(servers.s030[2-7].sysstat.cpu.all.system,1,4), aliasByNode(servers.s030[2-7].sysstat.cpu.all.user,1,4))",
                         'cpu_context_switches' : 'aliasByNode(servers.s030[2-7].sysstat.context_switches.context_switches,1)',
                         'tcp_sockets' : 'aliasByNode(servers.s030[2-7].sysstat.sockets.tcp,1)',
                         'disk_reads' : 'aliasByNode(servers.s030[2-7].sysstat.io.blocks_read,1)',
                         'disk_writes' : 'aliasByNode(servers.s030[2-7].sysstat.io.blocks_written,1)'
                     },
                     grid=Grid(
                         Row(Cell(span=12,
                                  presentation=StandardTimeSeries(css_class='height4',
                                                                  title='CPU Usage',
                                                                  y_axis_label='CPU Usage %',
                                                                  query_name='cpu')))
                         ,Row(Cell(span=2,
                                   presentation=SingleStat(title='Mean Context Switches',
                                                           query_name='cpu_context_switches',
                                                           transform='mean',
                                                           units=' /sec',
                                                           decimal=0))
                             ,Cell(span=10,
                                   presentation=StackedAreaChart(css_class='height4',
                                                                 title='CPU Context Switches',
                                                                 y_axis_label='Context Switches per Second',
                                                                 query_name='cpu_context_switches')))
                         ,Row(Cell(span=2,
                                   presentation=SingleStat(title='Max TCP Sockets',
                                                           query_name='tcp_sockets',
                                                           transform='max',
                                                           decimal=0))
                             ,Cell(span=10,
                                   presentation=StackedAreaChart(css_class='height4',
                                                                 title='TCP Sockets',
                                                                 y_axis_label='Open TCP Socket Count',
                                                                 query_name='tcp_sockets')))
                     ))
