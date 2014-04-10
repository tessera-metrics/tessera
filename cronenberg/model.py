import cask

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

class GridEntry(object):
    def __init__(self, presentation, span, offset=None):
        self.presentation = presentation
        self.span = span
        self.offset = offset

class Presentation(object):
    def __init__(self, query, **kwargs):
        self.query = query

class DataTablePresentation(Presentation):
    def __init__(self, title, query):
        super(Presentation, self).__init__(query=query)

class SingleStatPresentation(Presentation):
    class Transform:
        MIN    = 'min'
        MAX    = 'max'
        MEDIAN = 'median'
        MEAN   = 'mean'
        LAST   = 'last'
        FIRST  = 'first'

    def __init__(self, title, query, transform=Transform.MEAN):
        super(SingleStatPresentation, self).__init__(query=query)
        self.title = title
        self.attribute = attribute

class ChartPresentation(Presentation):
    def __init__(self, query, title=None, chart_type='timeseries'):
        super(ChartPresentation, self).__init__(query=query)
        self.title = title
        self.chart_type = chart_type

class Dashboard(cask.NamedEntity):
    def __init__(self, name, queries, grid):
        super(Dashboard, self).__init__(name=name)
        self.queries = queries
        self.grid = grid
