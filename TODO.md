# Tasks

### Third Party Components

- upgrade to DataTables 1.10
- upgrade to bootstrap3 (darkstrap support is only unofficial and
  incomplete so far - see
  [here](https://github.com/danneu/darkstrap/issues/17))
- ~~upgrade to jQuery 1.11~~

### Model & Persistence

- refactor API to a flask blueprint to reuse for different model
  classes
- Refactor how from_json() works, maybe a metaclass or somesuch, to
  cut down on the janky dispatching
- more sophisticated persistence (i.e. SQLAlchemy or somesuch) that
  would allow tagging and searching by tag
- only dashboards are named entities right now. Presentations should
  *optionally* be named entities, so they can be reused between
  dashboards w/o duplication (ditto queries).
  - templatized presentations should also be named entities
  - that requires queries to be (optionally) named entities too, since
    they're independent of presentations
- element_id doesn't need to be stored; just generate unique element
  IDs in expanded API view. Current method has chance for collisions.
- ~~add support for multi-valued queries (graphite URL api supports
  multiple values for target). Will help with graphite dashboard
  importing~~
- ~~Persistence for model objects via cask~~
- ~~queries should be dumped to JSON without graphite hostname or
  format=json in URL. Need a render_url_path w/o format or host~~
- ~~basic API for dashboards~~

### Presentations

- [dc.js](http://nickqizhu.github.io/dc.js/) with [crossfilter](http://square.github.io/crossfilter/).
- nvd3: [multi-bar](http://nvd3.org/examples/multiBar.html) option for time series
- nvd3: has an
  [excellent implementation](http://nvd3.org/examples/bullet.html) of
  Stephen Few's
  [bullet graph](http://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf).
- pie/donut chart needs some CSS tweaking for dark mode
- ``SummationComparisonTable``, compare 2 series w/% change indicator (see stathat)
- allow selection of which columns are display in ``SummationTable``
- [tasseo](https://github.com/obfuscurity/tasseo)-style simple graphs (combination of a singlestat and simple_time_series with fill)
- multi-stat version of ``SingleStat`` that flips through them using a
  carousel (i.e. [Slick](http://kenwheeler.github.io/slick) which is
  the......slickest carousel I've found yet).
- ``JumboTronSinglestat`` is a hack. A properly responsive presentation
  that scales w/size of parent would rock.
- horizon graphs with [Cubism](http://square.github.io/cubism/)
- dashboard sections. Section = separator + heading + rows, collapsible (click on heading)
  - alternate rendering as tabs
- thresholds for alert colors (i.e. turn value in singlestat yellow/orange/red)
- threshold to automatically switch to graphite rendering for long
  time windows (SVG rendering in browser gets slow)
- more options for time formatting
- ~~titles~~
- ~~donut/pie charts~~
- ~~replace use of jquery.number with d3.format. No need to carry around
  two number formatters.~~
- ~~height needs to be a first-class attribute, not just smashed into css_class~~
- ~~min/max/mean/total datatable - see
  [stathat](http://blog.stathat.com/2014/04/09/web-app-interface-changes-stats.html)
  for a nice example (and a
  [rundown of the components used](http://blog.stathat.com/2014/04/10/whats-powering-the-new-web-interface.html)).~~
- ~~axis labels~~
- ~~Lists of presentations per cell~~
  - and/or nested rows
- ~~text presentations. Just put some formatted text in a grid Cell for
  explanation. Render markdown with
  [markdown.js](https://github.com/evilstreak/markdown-js) or
  [showdown.js](https://github.com/coreyti/showdown). ~~Alternatively,
  here's a [flask snippet](http://flask.pocoo.org/snippets/19/) for
  rendering markdown server-side.~~
      - ~~[Flask-Misaka](https://flask-misaka.readthedocs.org/en/latest/)
        looks even better. Presentation template would just be
        {{item.text|markdown}}~~

### Editing

- ~~Client-side rendering. Not strictly needed for creating an editor, but preferable.~~
  - ~~passing complex options to javascript code is clumsy using server side templates~~
  - ~~needed for dynamic editing~~
  - ~~depends on API~~
  - ~~API depends on persistence~~
  - ~~tentative candidate is [Handlebars](http://handlebarsjs.com/)~~
    - ~~probably need to define a block helper for render dispatching
      based on presentation type. Don't think Handlebars has callable
      macros like jinja2.~~

### UI

- custom time range picker
- configuration for the recent time ranges shown in the easy picker
- refresh button
- auto-refresh
- settings page
- ~~Add a 'full screen' button that removes everything except the
  dashboard grid from the view (and a 'back' button to restore it)~~
  - ~~already have ``cronenberg.enterFullScreen()`` and
    ``cronenberg.exitFullScreen()`` APIs with events. UI bits just
    need to register for those events to hide/show.~~
  - ~~alternatively, just use data-attributes for fullscreen hide/show~~
  - drop-down version of the range picker menu, to save space
  - ~~In full-screen, put the title, range picker, current time, and
    exit fullscreen button all on one line~~
- ~~dark/light theme switching~~
  - ~~session persistence~~
  - other themes, like [Solarized](http://ethanschoonover.com/solarized).

### Navigation

- Add "Featured" dashboards to front page (see [test screenshot](https://urbanairship.box.com/s/nzy4pq558dnednb9k4r9))

### Integration

- LDAP integration
  - persistent sessions based on login
  - user preferences
- integrate some proper JS build-fu to minify and compress all the
  javascript, etc...
- import of gdash dashboards
- ~~import of graphite built-in dashboards~~
- ~~start with anonymous, non-persistent sessions. ~~
- ~~excise dependence on toolbox's graphite classes entirely (partway there already) ~~

### Bugs

- hover! Why do the tables all have hover backgrounds when I haven't
  specified class="table-hover", and why is the background in dark
  mode excessively light?
- yAxis labels. probably a JS scoping issue.
- ~~bottom margin on graphs has disappeared. wtf? ~~
  - ~~it's the dashboard-height classes. NVD3 renders the svg taller
    than them, so they get clipped. Remove the height classes after
    rendering? patch nvd3?~~
