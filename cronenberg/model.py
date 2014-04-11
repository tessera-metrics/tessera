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

# =============================================================================
# Presentations
# =============================================================================

class Presentation(object):
    NEXT = 1

    @staticmethod
    def nextid():
        Presentation.NEXT += 1
        return 'p{0}'.format(Presentation.NEXT)

    def __init__(self, query_name, presentation_type):
        self.query_name = query_name
        self.presentation_type = presentation_type
        self.element_id = Presentation.nextid()

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
        super(SingleStat, self).__init__(query_name=query_name,
                                         presentation_type='singlestat')
        self.title = title
        self.transform = transform
        self.index = index
        self.align = align
        self.units = units
        self.decimal = decimal

class SimpleTimeSeries(Presentation):
    def __init__(self, query_name):
        super(SimpleTimeSeries, self).__init__(query_name=query_name,
                                               presentation_type='simple_time_series')


# =============================================================================
# Layout
# =============================================================================

class LayoutElement(object):
    def __init__(self, layout_type, css_class=''):
        self.layout_type = layout_type
        self.css_class = css_class

class Cell(LayoutElement):
    def __init__(self, presentation, span, emphasize=False, offset=None, **kwargs):
        super(Cell, self).__init__(layout_type='cell', **kwargs)
        self.presentation = presentation
        self.span = span
        self.offset = offset
        self.emphasize = emphasize

class Row(LayoutElement):
    def __init__(self, *cells, **kwargs):
        super(Row, self).__init__(layout_type='row', **kwargs)
        self.cells = cells

class Grid(LayoutElement):
    def __init__(self, *rows, **kwargs):
        super(Grid, self).__init__(layout_type='grid', **kwargs)
        self.rows = rows

class Separator(LayoutElement):
    def __init__(self, **kwargs):
        super(Separator, self).__init__(layout_type='separator', **kwargs)

class Dashboard(cask.NamedEntity):
    def __init__(self, name, queries, grid):
        super(Dashboard, self).__init__(name=name)
        self.queries = queries
        self.grid = grid
