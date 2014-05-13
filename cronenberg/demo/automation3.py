import json
import sys
from ..model import *
from ..model.database import *

# =============================================================================

argon_mutation_events = [
    'apid_create',
    'apid_delete',
    'apid_reg_create',
    'apid_reg_delete',
    'apid_reg_update',
    'apid_update',
    'device_create',
    'device_open',
    'device_reg_add_tags',
    'device_reg_batch_replace_tag',
    'device_reg_deactivate',
    'device_reg_delete',
    'device_reg_destroy',
    'device_reg_remove_tags',
    'device_reg_uninstall',
    'device_reg_update',
    'device_update_location',
    'device_update_timezone',
    'disable_inactive_apid_device',
    'uninstall_stale_push_address'
]

queries = {
    'argon_total' : 'nonNegativeDerivative(sumSeries({{ua-service "triggers-gorram-consumer"}}.argonmutationconsumer_meter.totalmutationsreceived.Count))',
    'argon_ignored' : 'nonNegativeDerivative(sumSeries({{ua-service "triggers-gorram-consumer"}}.argonmutationconsumer_meter.ignorednoreceiverfortype.Count))'
}

for event in argon_mutation_events:
    queries['argon_' + event] = 'nonNegativeDerivative(sumSeries({{{{ua-service "triggers-gorram-consumer"}}}}.argonmutationconsumer_timer.{0}_processed.Count))'.format(event)

# =============================================================================

def argon_top_row():
    return Row(items=[
        Cell(span=3, style='well', align='center', items=[ SingleStat(title='Processed Argon Events', format=',.0f', transform='sum', query='argon_total'),
                                                           SingleStat(title='Ignored Argon Events', format=',.0f', transform='sum', query='argon_ignored')
                                                           ]),
        Cell(span=9, style='well', items=StandardTimeSeries(height=5, query='argon_total', title='Total Argon Mutations Processed'))
    ])

def event_row(event):
    return Row(items=[
        Cell(span=3, align='right', items=[
            SingleStat(title='Total', query='argon_' + event, transform='sum', format=',.3s'),
        ]),
        Cell(span=9, items=StandardTimeSeries(title=event, query='argon_' + event))
    ])

#def summary_section():
#    return Section(items=[
#        top_row()
#    ])

def argon_mutation_section():
    section = Section(items=[Heading(text='Argon Mutation Events',
                                     description="Counts for events received by triggers-gorram-consumer"),
                             Separator(),
                             argon_top_row()
                             ])
    for event in argon_mutation_events:
        section.items.extend([event_row(event)])
    return section

def demo_automation_3():
    return database.Dashboard(
        title='Event Stream',
        category='Automation',
        summary='Incoming raw events',
        tags=[ Tag('automation'), Tag('featured') ],
        definition=DashboardDef(
            definition=dumps(
                DashboardDefinition(
                    queries=queries,
                    items=[
                        argon_mutation_section()
                    ]
                ))))
