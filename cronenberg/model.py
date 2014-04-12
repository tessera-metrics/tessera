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
    class Transform:
        MIN    = 'min'
        MAX    = 'max'
        MEDIAN = 'median'
        MEAN   = 'mean'
        LAST   = 'last'
        FIRST  = 'first'

    NEXT = 1

    @staticmethod
    def nextid():
        Presentation.NEXT += 1
        return 'p{0}'.format(Presentation.NEXT)

    def __init__(self, query_name, presentation_type, css_class=None):
        self.query_name = query_name
        self.presentation_type = presentation_type
        self.element_id = Presentation.nextid()
        self.css_class = css_class

class SingleStat(Presentation):
    def __init__(self, title, query_name, units='', decimal=3, index=0, transform=Presentation.Transform.MEAN, **kwargs):
        super(SingleStat, self).__init__(query_name=query_name,
                                         presentation_type=kwargs.get('presentation_type', 'singlestat'),
                                         **kwargs)
        self.title = title
        self.transform = transform
        self.index = index
        self.units = units
        self.decimal = decimal

class JumbotronSingleStat(SingleStat):
    def __init__(self, **kwargs):
        super(JumbotronSingleStat, self).__init__(**kwargs)
        self.presentation_type='jumbotron_singlestat'

class SimpleTimeSeries(Presentation):
    def __init__(self, query_name, **kwargs):
        super(SimpleTimeSeries, self).__init__(query_name=query_name,
                                               presentation_type='simple_time_series',
                                               **kwargs)

class StandardTimeSeries(Presentation):
    def __init__(self, query_name, **kwargs):
        super(StandardTimeSeries, self).__init__(query_name=query_name,
                                                 presentation_type='standard_time_series',
                                                 **kwargs)

class StackedAreaChart(Presentation):
    def __init__(self, query_name, **kwargs):
        super(StackedAreaChart, self).__init__(query_name=query_name,
                                               presentation_type='stacked_area_chart',
                                               **kwargs)

# =============================================================================
# Layout
# =============================================================================

class LayoutElement(object):
    def __init__(self, layout_type, css_class=''):
        self.layout_type = layout_type
        self.css_class = css_class

class Cell(LayoutElement):
    def __init__(self, presentation, span, emphasize=False, offset=None, align=None, **kwargs):
        super(Cell, self).__init__(layout_type='cell', **kwargs)
        self.presentation = presentation
        self.span = span
        self.offset = offset
        self.emphasize = emphasize
        self.align = align

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
    def __init__(self, name, queries, grid, category='', title='', description=''):
        super(Dashboard, self).__init__(name=name)
        self.queries = queries
        self.grid = grid
        self.category = category
        self.title = title
        self.description = description
