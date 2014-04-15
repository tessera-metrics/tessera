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

def _delattr(dictionary, attr):
    if attr in dictionary:
        del dictionary[attr]

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

    def __init__(self, query_name, item_type, element_id=None, css_class=None):
        self.query_name = query_name
        self.item_type = item_type
        self.element_id = element_id or Presentation.nextid()
        self.css_class = css_class

    @classmethod
    def from_json(cls, d):
        item_type = d['item_type']
        if item_type == 'singlestat':
            return SingleStat.from_json(d)
        elif item_type == 'jumbotron_singlestat':
            return JumbotronSingleStat.from_json(d)
        elif item_type == 'simple_time_series':
            return SimpleTimeSeries.from_json(d)
        elif item_type =='standard_time_series':
            return StandardTimeSeries.from_json(d)
        elif item_type == 'stacked_area_chart':
            return StackedAreaChart.from_json(d)

class SingleStat(Presentation):
    def __init__(self, title, query_name, units='', decimal=3, index=False, transform=Presentation.Transform.MEAN, **kwargs):
        super(SingleStat, self).__init__(query_name=query_name,
                                         item_type=kwargs.get('item_type', 'singlestat'),
                                         **kwargs)
        self.title = title
        self.transform = transform
        self.index = index
        self.units = units
        self.decimal = decimal

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

class JumbotronSingleStat(SingleStat):
    def __init__(self, **kwargs):
        super(JumbotronSingleStat, self).__init__(**kwargs)
        self.item_type='jumbotron_singlestat'

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

class ChartPresentation(Presentation):
    def __init__(self, title='', options={}, **kwargs):
        super(ChartPresentation, self).__init__(**kwargs)
        self.title = title
        self.options = options

class SimpleTimeSeries(ChartPresentation):
    def __init__(self, query_name, **kwargs):
        super(SimpleTimeSeries, self).__init__(query_name=query_name,
                                               item_type='simple_time_series',
                                               **kwargs)
    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

class StandardTimeSeries(ChartPresentation):
    def __init__(self, query_name, **kwargs):
        super(StandardTimeSeries, self).__init__(query_name=query_name,
                                                 item_type='standard_time_series',
                                                 **kwargs)
    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

class StackedAreaChart(ChartPresentation):
    def __init__(self, query_name, **kwargs):
        super(StackedAreaChart, self).__init__(query_name=query_name,
                                               item_type='stacked_area_chart',
                                               **kwargs)
    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

# =============================================================================
# Layouts
# =============================================================================

class LayoutElement(object):
    """Layout elements are class that define how presentations are
    arrange in the dashboard. The base class provides common CSS class
    overriding.
    """
    def __init__(self, item_type, css_class=''):
        self.item_type = item_type
        self.css_class = css_class

    @classmethod
    def from_json(cls, d):
        # TODO - this can be handled more cleanly and more
        # pythonically. E.g. with a dict, or some decorators, or a
        # metaclass.
        item_type = d['item_type']
        _delattr(d, 'item_type')
        if item_type == 'separator':
            return Separator.from_json(d)
        elif item_type == 'heading':
            return Heading.from_json(d)
        elif item_type == 'markdown':
            return Markdown.from_json(d)
        elif item_type == 'row':
            return Row.from_json(d)
        elif item_type == 'grid':
            return Grid.from_json(d)
        else:
            return Cell.from_json(d)


class Cell(LayoutElement):
    """Cell defines how to position and size a presentation on the
    grid. Cells should be contained in Rows.
    """
    def __init__(self, presentation, span, emphasize=False, offset=None, align=None, **kwargs):
        super(Cell, self).__init__(item_type='cell', **kwargs)
        self.presentation = presentation if isinstance(presentation, list) else [presentation]
        self.span = span
        self.offset = offset
        self.emphasize = emphasize
        self.align = align

    @classmethod
    def from_json(cls, d):
        d['presentation'] = [Presentation.from_json(p) for p in d['presentation']]
        _delattr(d, 'item_type')
        return Cell(**d)


class Row(LayoutElement):
    """A row holds one or more Cells, which span a single row in the
    rendered layout grid. An instance of Row maps directly to a <div
    class="row">...</div>.
    """
    def __init__(self, *cells, **kwargs):
        super(Row, self).__init__(item_type='row', **kwargs)
        self.cells = cells

    @classmethod
    def from_json(cls, d):
        cells = [LayoutElement.from_json(c) for c in d['cells']]
        _delattr(d, 'item_type')
        _delattr(d, 'cells')
        return Row(*cells, **d)


class Grid(LayoutElement):
    def __init__(self, *rows, **kwargs):
        super(Grid, self).__init__(item_type='grid', **kwargs)
        self.rows = rows

    @classmethod
    def from_json(cls, d):
        rows = [LayoutElement.from_json(r) for r in d['rows']]
        _delattr(d, 'item_type')
        _delattr(d, 'rows')
        return Grid(*rows, **d)


class Separator(LayoutElement):
    """A visual element to separate groups of elements.
    """
    def __init__(self, **kwargs):
        super(Separator, self).__init__(item_type='separator', **kwargs)

    @classmethod
    def from_json(cls, d):
        return Separator(css_class=d['css_class'])


class Heading(LayoutElement):
    """A large text label."""
    def __init__(self, text, level=1, description='', **kwargs):
        super(Heading, self).__init__(item_type='heading', **kwargs)
        self.text = text
        self.level = level
        self.description = description

    @classmethod
    def from_json(cls, d):
        return Heading(text=d['text'],
                       level=d['level'],
                       description = d.get('description', ''),
                       css_class=d['css_class'])


class Markdown(LayoutElement):
    def __init__(self, text, **kwargs):
        super(Markdown, self).__init__(item_type='markdown', **kwargs)
        self.text = text


class Dashboard(cask.NamedEntity):
    def __init__(self, name, queries, grid, item_type='dashboard', category='', title='', description=''):
        super(Dashboard, self).__init__(name=name)
        self.item_type = item_type
        self.queries = queries
        self.grid = grid
        self.category = category
        self.title = title
        self.description = description

    @classmethod
    def from_json(cls, name, d):
        d['grid'] = Grid.from_json(d['grid'])
        _delattr(d, 'name')
        return Dashboard(name=name, **d)


class DashboardManager(cask.EntityStorageManager):
    def __init__(self, data_directory, extension=None):
        super(DashboardManager, self).__init__(data_directory, extension=extension)
        self.register_class(Dashboard)
