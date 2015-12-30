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
# Dashboard & Tag
# -----------------------------------------------------------------------------

class Dashboard(object):
    def __init__(self,
                 id                 = None,
                 title              = None,
                 category           = None,
                 description        = None,
                 summary            = None,
                 creation_date      = None,
                 last_modified_date = None,
                 imported_from      = None,
                 definition_href    = None,
                 view_href          = None,
                 href               = None,
                 tags               = [],
                 definition         = None):
        self.id              = id
        self.title           = title
        self.category        = category
        self.description     = description
        self.summary         = summary
        self.imported_from   = imported_from
        self.definition_href = definition_href
        self.view_href       = view_href
        self.href            = href
        self.tags            = [ Tag.from_json(t) for t in tags ]
        self.definition      = DashboardDefinition.from_json(definition)

    @classmethod
    def from_json(cls, d):
        if isinstance(d, cls):
            return d
        return cls(**d)

class Tag(object):
    def __init__(self,
                 id          = None,
                 name        = None,
                 description = None,
                 bgcolor     = None,
                 fgcolor     = None,
                 count       = None):
        self.id          = id
        self.name        = name
        self.description = description
        self.bgcolor     = bgcolor
        self.fgcolor     = fgcolor
        self.count       = count

    @classmethod
    def from_json(cls, d):
        if isinstance(d, cls):
            return d
        elif isinstance(d, basestring):
            return cls(name=d)
        else:
            return cls(**d)

    def to_json(self):
        json = dict()
        if self.id:
            json['id'] = self.id
        if self.name:
            json['name'] = self.name
        if self.description:
            json['description'] = self.description
        if self.bgcolor:
            json['bgcolor'] = self.bgcolor
        if self.fgcolor:
            json['fgcolor'] = self.fgcolor
        if self.count:
            json['count'] = self.count
        return json

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
        self.other     = kwargs

    def to_json(self):
        data = dict(item_type=self.item_type,
                    item_id=self.item_id)
        if self.css_class:
            data['css_class'] = self.css_class
        if self.style:
            data['style'] = self.style
        if self.height:
            data['height'] = self.height
        if self.other:
            for k, v in self.other.items():
                data[k] = v
        return data

    @classmethod
    def from_json(cls, d):
        if isinstance(d, DashboardItem):
            return d

        item_type = d['item_type']
        _delattr(d, 'item_type')

        if item_type in cls.CLASS_MAP:
            return cls.CLASS_MAP[item_type].from_json(d)
        else:
            return DashboardItem(item_type, **d)

    @classmethod
    def model(cls, item_type):
        def process(model_cls):
            model_cls.item_type = item_type
            cls.CLASS_MAP[item_type] = model_cls
            return model_cls
        return process

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

    def to_json(self):
        data = super(Presentation, self).to_json()
        if self.query:
            data['query'] = self.query
        if self.thresholds:
            data['thresholds'] = self.thresholds
        return data


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

    def to_json(self):
        data = super(SingleStat, self).to_json()
        if self.title:
            data['title'] = self.title
        if self.transform:
            data['transform'] = self.transform
        if self.index:
            data['index'] = self.index
        if self.units:
            data['units'] = self.units
        if self.format:
            data['format'] = self.format
        return data

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
                 sortable = False,
                 **kwargs):
        super(SummationTable, self).__init__(query     = query,
                                             item_type = 'summation_table',
                                             **kwargs)
        self.title   = title
        self.format  = format
        self.striped = striped
        self.sortable = sortable

    @classmethod
    def from_json(cls, d):
        _delattr(d, 'item_type')
        return cls(**d)

    def to_json(self):
        data = super(SummationTable, self).to_json()
        if self.title:
            data['title'] = self.title
        if self.format:
            data['format'] = self.format
        if self.striped is not None:
            data['striped'] = self.striped
        if self.sortable is not None:
            data['sortable'] = self.sortable
        return data

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

    def to_json(self):
        data = super(ChartPresentation, self).to_json()
        if self.title:
            data['title'] = self.title
        if self.options:
            data['options'] = self.options
        if self.interactive is not None:
            data['interactive'] = self.interactive
        return data

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

    def to_json(self):
        data = super(SimpleTimeSeries, self).to_json()
        if self.filled is not None:
            data['filled'] = self.filled
        return data


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

    def to_json(self):
        data = super(SingleGraph, self).to_json()
        if self.format:
            data['format'] = self.format
        if self.transform:
            data['transform'] = self.transform
        return data


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

    def to_json(self):
        json = super(DashboardContainer, self).to_json()
        json['items'] = [ item.to_json() for item in self.items ]
        return json

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

    def to_json(self):
        data = super(Cell, self).to_json()
        if self.span:
            data['span'] = self.span
        if self.offset:
            data['offset'] = self.offset
        if self.align:
            data['align'] = self.align
        return data

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

    def to_json(self):
        data = super(Section, self).to_json()
        if self.layout:
            data['layout'] = self.layout
        if self.title:
            data['title'] = self.title
        return data

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

    def to_json(self):
        data = super(Heading, self).to_json()
        if self.text:
            data['text'] = self.text
        if self.level:
            data['level'] = self.level
        if self.description:
            data['description'] = self.description
        return data


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

    def to_json(self):
        data = super(Markdown, self).to_json()
        if self.text:
            data['text'] = self.text
        if self.raw:
            data['raw'] = self.raw
        return data


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

    def to_json(self):
        data = super(DashboardDefinition, self).to_json()
        if self.queries:
            data['queries'] = self.queries
        return data

    @classmethod
    def from_json(cls, data):
        if isinstance(data, DashboardDefinition) or data is None:
            return data
        DashboardContainer._process_items(data)
        return DashboardDefinition(**data)
