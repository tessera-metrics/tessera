import cask

class Query(cask.NamedEntity):
    def __init__(self, name, targets=None, **kwargs):
        super(Query, self).__init__(name=name)
        self.targets = targets

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
    def __init__(self, presentation, span, **kwargs):
        self.presentation = presentation
        self.span = span

class Presentation(object):
    def __init__(self, query, **kwargs):
        self.query = query

class DataTablePresentation(Presentation):
    def __init__(self, title, query, **kwargs):
        super(Presentation, self).__init__(query=query, **kwargs)

class SingleStatPresentation(Presentation):
    def __init__(self, title, query, attribute='max', **kwargs):
        super(SingleStatPresentation, self).__init__(query=query, **kwargs)
        self.title = title
        self.attribute = attribute

class ChartPresentation(Presentation):
    def __init__(self, query, chart_type='timeseries', **kwargs):
        super(ChartPresentation, self).__init__(query=query, **kwargs)
        self.chart_type = chart_type

class Dashboard(cask.NamedEntity):
    def __init__(self, name, queries, grid, **kwargs):
        super(Dashboard, self).__init__(name=name)
        self.queries = queries
        self.grid = grid
