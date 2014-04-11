import cask
import uuid
import base64

# class Query(cask.NamedEntity):
#     """Represents a graphite query with one or more targets."""
#     def __init__(self, name, targets=None):
#         super(Query, self).__init__(name=name)
#         self.targets = [targets if isinstance(targets, list) else [targets]]

#     def to_json(self):
#         return { 'name' : self.name,
#                  'targets' : [ str(t) for t in self.targets ] }

class Grid(object):
    def __init__(self, rows=[], **kwargs):
        self.rows = [ Grid.__process_row(r) for r in rows ]

    @staticmethod
    def __process_entry(e):
        if isinstance(e, GridEntry):
            return e
        elif isinstance(dict, e):
            return GridEntry(**e)
        else:
            return None

    @staticmethod
    def __process_row(row):
        return [ Grid.__process_entry(e) for e in row ]

class LayoutEntry(object):
    def __init__(self, presentation, span, emphasize=False, offset=None):
        self.presentation = presentation
        self.span = span
        self.offset = offset
        self.emphasize = emphasize

class Presentation(object):
    NEXT = 1

    @staticmethod
    def nextid():
        Presentation.NEXT += 1
        return 'p{0}'.format(Presentation.NEXT)

    def __init__(self, query_name):
        self.query_name = query_name
        self.element_id = Presentation.nextid()

class DataTablePresentation(Presentation):
    def __init__(self, title, query_name):
        super(Presentation, self).__init__(query_name=query_name)

class SingleStat(Presentation):
    """
    """
    class Transform:
        MIN    = 'min'
        MAX    = 'max'
        MEDIAN = 'median'
        MEAN   = 'mean'
        LAST   = 'last'
        FIRST  = 'first'

    def __init__(self, title, query_name, units='', decimal=3, index=0, align=None, transform=Transform.MEAN):
        super(SingleStat, self).__init__(query_name=query_name)
        self.title = title
        self.transform = transform
        self.index = index
        self.align = align
        self.units = units
        self.decimal = decimal

class SimpleTimeSeries(Presentation):
    def __init__(self, query_name):
        super(SimpleTimeSeries, self).__init__(query_name=query_name)

class ChartPresentation(Presentation):
    def __init__(self, query_name, title=None, chart_type='timeseries'):
        super(ChartPresentation, self).__init__(query_name=query_name)
        self.title = title
        self.chart_type = chart_type

class Dashboard(cask.NamedEntity):
    def __init__(self, name, queries, grid):
        super(Dashboard, self).__init__(name=name)
        self.queries = queries
        self.grid = grid
