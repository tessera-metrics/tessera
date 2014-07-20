import json

class EntityEncoder(json.JSONEncoder):
    def default(self, obj):
            # TODO - handle iterables
        if isinstance(obj, list) or isinstance(obj, tuple):
            return [ self.default(i) for i in obj ]
        elif isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                result[key] = self.default(value)
            return result
        elif hasattr(obj, 'to_json') and callable(getattr(obj, 'to_json')):
            return obj.to_json()
        elif hasattr(obj, '__dict__'):
            return self.default(obj.__dict__)
        else:
            return obj

def dumps(obj):
    return json.dumps(obj, cls=EntityEncoder, indent=0)

# -----------------------------------------------------------------------------
# Dashboard Items
# -----------------------------------------------------------------------------

def _delattr(dictionary, attr):
    if attr in dictionary:
        del dictionary[attr]

class Thresholds(object):
    """
    JS class: ds.models.thresholds
    """
    def __init__(self,
                 summation_type = 'max',
                 warning        = None,
                 danger         = None):
        self.summation_type = summation_type
        self.warning        = warning
        self.danger         = danger



class DashboardItem(object):
    """
    JS class: ds.models.item
    """

    CLASS_MAP = {}

    def __init__(self,
                 item_type = None,
                 css_class = None,
                 style     = None,
                 height    = None,
                 item_id   = None,
                 **kwargs):
        try:
            self.item_type = self.__class__.item_type
        except AttributeError:
            self.item_type = item_type
        self.item_id   = item_id
        self.css_class = css_class
        self.height    = height
        self.style     = style

    @classmethod
    def from_json(cls, d):
        if isinstance(d, DashboardItem):
            return d

        item_type = d['item_type']
        _delattr(d, 'item_type')

        if item_type in cls.CLASS_MAP:
            return cls.CLASS_MAP[item_type].from_json(d)
        else:
            return GenericDashboardItem(item_type, **d)

    @classmethod
    def model(cls, item_type):
        def process(model_cls):
            model_cls.item_type = item_type
            cls.CLASS_MAP[item_type] = model_cls
            return model_cls
        return process


class GenericDashboardItem(DashboardItem):
    def __init__(self,
                 item_type,
                 css_class = None,
                 style     = None,
                 height    = None,
                 item_id   = None,
                 **kwargs):
        super(GenericDashboardItem, self).__init__(item_type,
                                                   css_class = css_class,
                                                   style     = style,
                                                   height    = height,
                                                   item_id   = item_id)
        self.other = kwargs

    def to_json(self):
        data = {
            'item_type' : self.item_type,
            'item_id'   : self.item_id,
            'css_class' : self.css_class,
            'style'     : self.style,
            'height'    : self.height
        }
        if self.other:
            for k, v in self.other.items():
                data[k] = v
        return data

# -----------------------------------------------------------------------------
# Presentations
# -----------------------------------------------------------------------------

class Presentation(DashboardItem):
    class Transform:
        MIN    = 'min'
        MAX    = 'max'
        MEDIAN = 'median'
        MEAN   = 'mean'
        LAST   = 'last'
        FIRST  = 'first'

    def __init__(self,
                 query      = None,
                 thresholds = None,
                 **kwargs):
        super(Presentation, self).__init__(**kwargs)
        self.query      = query
        self.thresholds = thresholds


# -----------------------------------------------------------------------------
# Text Presentations
# -----------------------------------------------------------------------------

@DashboardItem.model('singlestat')
class SingleStat(Presentation):
    """
    JS class: ds.models.singlestat
    """
    def __init__(self,
                 title     = None,
                 query     = None,
                 units     = None,
                 format    = ',.3s',
                 index     = False,
                 transform = Presentation.Transform.MEAN,
                 **kwargs):
        super(SingleStat, self).__init__(query=query,
                                         **kwargs)
        self.title     = title
        self.transform = transform
        self.index     = index
        self.units     = units
        self.format    = format

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

@DashboardItem.model('jumbotron_singlestat')
class JumbotronSingleStat(SingleStat):
    """
    JS class: ds.models.jumbotron_singlestat
    """
    def __init__(self, **kwargs):
        super(JumbotronSingleStat, self).__init__(**kwargs)

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

class TablePresentation(Presentation):
    """Base class for all text-table-based presentations."""
    def __init__(self, **kwargs):
        super(TablePresentation, self).__init__(**kwargs)

@DashboardItem.model('summation_table')
class SummationTable(TablePresentation):
    """
    JS class: ds.models.summation_table
    """
    def __init__(self,
                 query   = None,
                 title   = None,
                 format  = ',.3f',
                 striped = False,
                 **kwargs):
        super(SummationTable, self).__init__(query     = query,
                                             item_type = 'summation_table',
                                             **kwargs)
        self.title   = title
        self.format  = format
        self.striped = striped

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

# -----------------------------------------------------------------------------
# Chart Presentations
# -----------------------------------------------------------------------------

class ChartPresentation(Presentation):
    """Base class for all chart presentations.

    JS Class: ds.models.chart
    """
    def __init__(self,
                 title       = None,
                 options     = None,
                 interactive = True,
                 **kwargs):
        super(ChartPresentation, self).__init__(**kwargs)
        self.title       = title
        self.options     = options or {}
        self.interactive = interactive

@DashboardItem.model('donut_chart')
class DonutChart(ChartPresentation):
    """
    JS class: ds.models.donut_chart
    """
    def __init__(self, **kwargs):
        super(DonutChart, self).__init__(**kwargs)

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

@DashboardItem.model('simple_time_series')
class SimpleTimeSeries(ChartPresentation):
    """A simple, somewhat abstracted view of a single time series,
    presented without a lot of chart extras, for high level
    visualizations.

    JS class: ds.models.simple_time_series
    """
    def __init__(self,
                 query  = None,
                 filled = False,
                 **kwargs):
        super(SimpleTimeSeries, self).__init__(query     = query,
                                               item_type = 'simple_time_series',
                                               **kwargs)
        self.filled = filled

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

@DashboardItem.model('singlegraph')
class SingleGraph(ChartPresentation):
    """A combination of SingleStat and SimpleTimeSeries - displays a
    single metric as a line graph, with a summation value overlayed
    (ala Tasseo).

    JS class: ds.models.single_graph
    """
    def __init__(self,
                 query     = None,
                 format    = ',.1s',
                 transform = Presentation.Transform.MEAN,
                 **kwargs):
        super(SingleGraph, self).__init__(query     = query,
                                          item_type = kwargs.get('item_type', 'singlegraph'),
                                          **kwargs)
        self.format    = format
        self.transform = transform

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

@DashboardItem.model('standard_time_series')
class StandardTimeSeries(ChartPresentation):
    """A multi-series time series line chart, with all the bells and
    whistles.

    JS class: ds.models.standard_time_series
    """
    def __init__(self, query=None, **kwargs):
        super(StandardTimeSeries, self).__init__(query     = query,
                                                 item_type = 'standard_time_series',
                                                 **kwargs)
    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

@DashboardItem.model('stacked_area_chart')
class StackedAreaChart(ChartPresentation):
    """A multi-series stacked time series area chart, with all the bells
    and whistles and a few extras to boot.

    JS class: ds.models.stacked_area_chart
    """
    def __init__(self, query=None, **kwargs):
        super(StackedAreaChart, self).__init__(query     = query,
                                               item_type = 'stacked_area_chart',
                                               **kwargs)
    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

# -----------------------------------------------------------------------------
# Layouts
# -----------------------------------------------------------------------------

class DashboardContainer(DashboardItem):
    """Base class for all items that contain other items.

    """
    def __init__(self, items=None, **kwargs):
        super(DashboardContainer, self).__init__(**kwargs)
        if isinstance(items, list):
            self.items = items
        elif not items:
            self.items = []
        else:
            self.items = [items]

    @classmethod
    def _process_items(cls, data):
        data['items'] = [DashboardItem.from_json(i) for i in data['items']]


@DashboardItem.model('cell')
class Cell(DashboardContainer):
    """Cell defines how to position and size a presentation on the
    grid. Cells should be contained in Rows.
    """
    def __init__(self,
                 items  = None,
                 span   = 3,
                 offset = None,
                 align  = None,
                 **kwargs):
        super(Cell, self).__init__(items=items, **kwargs)
        self.span   = span
        self.offset = offset
        self.align  = align

    @classmethod
    def from_json(cls, d):
        DashboardContainer._process_items(d)
        _delattr(d, 'item_type')
        return Cell(**d)


@DashboardItem.model('row')
class Row(DashboardContainer):
    """A row holds one or more Cells, which span a single row in the
    rendered layout grid. An instance of Row maps directly to a <div
    class="row">...</div>.
    """
    def __init__(self, items=None, **kwargs):
        super(Row, self).__init__(items=items, **kwargs)

    @classmethod
    def from_json(cls, d):
        DashboardContainer._process_items(d)
        _delattr(d, 'item_type')
        return Row(**d)


@DashboardItem.model('section')
class Section(DashboardContainer):
    class Layout:
        FIXED = 'fixed'
        FLUID = 'fluid'
        NONE  = 'none'

    def __init__(self,
                 layout = Layout.FIXED,
                 items  = None,
                 title  = None,
                 **kwargs):
        super(Section, self).__init__(items=items, **kwargs)
        self.layout = layout
        self.title  = title

    @classmethod
    def from_json(cls, d):
        if not d:
            return Section()
        DashboardContainer._process_items(d)
        _delattr(d, 'item_type')
        return Section(**d)


@DashboardItem.model('separator')
class Separator(DashboardItem):
    """A visual element to separate groups of elements.
    """
    def __init__(self, **kwargs):
        super(Separator, self).__init__(**kwargs)

    @classmethod
    def from_json(cls, d):
        return Separator(**d)


@DashboardItem.model('heading')
class Heading(DashboardItem):
    """A large text label."""
    def __init__(self,
                 text        = None,
                 level       = 1,
                 description = None,
                 **kwargs):
        super(Heading, self).__init__(**kwargs)
        self.text        = text
        self.level       = level
        self.description = description

    @classmethod
    def from_json(cls, d):
        return Heading(**d)

@DashboardItem.model('markdown')
class Markdown(DashboardItem):
    def __init__(self,
                 text = None,
                 raw  = False,
                 **kwargs):
        super(Markdown, self).__init__(**kwargs)
        self.text = text
        self.raw  = raw

    @classmethod
    def from_json(cls, d):
        return Markdown(**d)


@DashboardItem.model('dashboard_definition')
class DashboardDefinition(DashboardContainer):
    def __init__(self,
                 queries   = None,
                 items     = None,
                 item_type = 'dashboard_definition',
                 **kwargs):
        super(DashboardDefinition, self).__init__(items     = items,
                                                  item_type = 'dashboard_definition',
                                                  **kwargs)
        self.queries = queries or {}
        for name in self.queries.keys():
            query = self.queries[name]
            if isinstance(query, dict):
                for key in list(query.keys()):
                    if key not in [ 'targets', 'name' ]:
                        del query[key]

    @classmethod
    def from_json(cls, data):
        if isinstance(data, DashboardDefinition) or data is None:
            return data
        DashboardContainer._process_items(data)
        return DashboardDefinition(**data)
