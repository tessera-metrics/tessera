# Tasks

### Third Party Components

- upgrade to jQuery 1.11
- upgrade to DataTables 1.10
- upgrade to bootstrap3 (darkstrap support is only unofficial and
  incomplete so far - see
  [here](https://github.com/danneu/darkstrap/issues/17))

### Model & Persistence

- ~~Persistence for model objects via cask~~
- ~~API for model objects~~
  - refactor to an API flask blueprint to reuse for different model
    classes
  - Refactor how from_json() works, maybe a metaclass or somesuch, to
    cut down on the janky dispatching
- more sophisticated persistence (i.e. SQLAlchemy or somesuch) that
  would allow tagging and searching by tag
- ~~queries should be dumped to JSON without graphite hostname or
  format=json in URL. Need a render_url_path w/o format or host~~
- only dashboards are named entities right now. Presentations should
  *optionally* be named entities, so they can be reused between
  dashboards w/o duplication (ditto queries).
  - templatized presentations should also be named entities
  - that requires queries to be (optionally) named entities too, since
    they're independent of presentations
- element_id doesn't need to be stored; just generate unique element
  IDs in expanded API view. Current method has chance for collisions.

### Presentations

- [tasseo](https://github.com/obfuscurity/tasseo)-style simple graphs (combination of a singlestat and simple_time_series with fill)
- multi-stat version of SingleStat that flips through them using a
  carousel (i.e. [Slick](http://kenwheeler.github.io/slick) which is
  the......slickest carousel I've found yet).
- min/max/mean/total datatable - see
  [stathat](http://blog.stathat.com/2014/04/09/web-app-interface-changes-stats.html)
  for a nice example (and a
  [rundown of the components used](http://blog.stathat.com/2014/04/10/whats-powering-the-new-web-interface.html)).
- JumboTronSinglestat is a hack. A properly responsive presentation
  that scales w/size of parent would rock.
- horizon graphs with [Cubism](http://square.github.io/cubism/)
- dashboard sections. Section = separator + heading + rows, collapsible (click on heading)
  - alternate rendering as tabs

- thresholds for alert colors (i.e. turn value in singlestat yellow/orange/red)
- threshold to automatically switch to graphite rendering for long
  time windows (SVG rendering in browser gets slow)
- more options for time formatting
- titles
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
- Add a 'full screen' button that removes everything except the
  dashboard grid from the view (and a 'back' button to restore it)
  - ~~already have ``cronenberg.enterFullScreen()`` and
    ``cronenberg.exitFullScreen()`` APIs with events. UI bits just
    need to register for those events to hide/show.~~
  - ~~alternatively, just use data-attributes for fullscreen hide/show~~
  - drop-down version of the range picker menu, to save space
  - In full-screen, put the title, range picker, current time, and
    exit fullscreen button all on one line
- ~~dark/light theme switching~~
  - ~~session persistence~~
  - other themes, like [Solarized](http://ethanschoonover.com/solarized).

### Integration

- sessions
  - start with anonymous, non-persistent sessions. Then can build onto
    LDAP & persistence, below.
- LDAP integration
  - user preferences
- integrate some proper JS build-fu to minify and compress all the
  javascript, etc...
- import of graphite built-in dashboards
- import of gdash dashboards
