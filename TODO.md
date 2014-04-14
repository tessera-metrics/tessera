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
- more sophisticated persistence (i.e. SQLAlchemy or somesuch) that
  would allow tagging and searching by tag
- queries should be dumped to JSON without graphite hostname or
  format=json in URL. Need a render_url_path w/o format or host
- dashboard sections. Section = separator + heading + rows, collapsible (click on heading)
  - alternate rendering as tabs

### Presentations

- more options for time formatting
- axis labels
- titles
- ~~Lists of presentations per cell~~
  - and/or nested rows
- min/max/mean/total datatable - see
  [stathat](http://blog.stathat.com/2014/04/09/web-app-interface-changes-stats.html)
  for a nice example (and a
  [rundown of the components used](http://blog.stathat.com/2014/04/10/whats-powering-the-new-web-interface.html)).
- text presentations. Just put some formatted text in a grid Cell for
  explanation. Render markdown with
  [markdown.js](https://github.com/evilstreak/markdown-js) or
  [showdown.js](https://github.com/coreyti/showdown). Alternatively,
  here's a [flask snippet](http://flask.pocoo.org/snippets/19/) for
  rendering markdown server-side.
      - [Flask-Misaka](https://flask-misaka.readthedocs.org/en/latest/)
        looks even better. Presentation template would just be
        {{item.text|markdown}}
- threshold to automatically switch to graphite rendering for long
  time windows (SVG rendering in browser gets slow)
- thresholds for alert colors (i.e. turn value in singlestat yellow/orange/red)
- JumboTronSinglestat is a hack. A properly responsive presentation
  that scales w/size of parent would rock.

### Editing

- Client-side rendering. Not strictly needed for creating an editor, but preferable.
  - passing complex options to javascript code is clumsy using server side templates
  - needed for dynamic editing
  - depends on API
  - API depends on persistence

### UI

- custom time range picker
- configuration for the recent time ranges shown in the easy picker
- refresh button
- auto-refresh
- Add a 'full screen' button that removes everything except the
  dashboard grid from the view (and a 'back' button to restore it)
  - already have ``cronenberg.enterFullScreen()`` and
    ``cronenberg.exitFullScreen()`` APIs with events. UI bits just
    need to register for those events to hide/show.
- dark/light theme switching

### Integration

- sessions
  - start with anonymous, non-persistent sessions. Then can build onto
    LDAP & persistence, below.
- LDAP integration
  - user preferences
- integrate some proper JS build-fu to minify and compress all the
  javascript, etc...
