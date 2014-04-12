# Tasks

- Add a 'full screen' button that removes everything except the
  dashboard grid from the view (and a 'back' button to restore it)
- Persistence for model objects via cask
- API for model objects
- dark/light theme switching
- sessions
- LDAP integration
  - user preferences
- threshold to automatically switch to graphite rendering for long
  time windows (SVG rendering in browser gets slow)
- thresholds for alert colors (i.e. turn value in singlestat yellow/orange/red)
- convert to bootstrap3
- queries should be dumped to JSON without graphite hostname or
  format=json in URL. Need a render_url_path w/o format or host
- more options for time formatting
- axis labels
- titles
- dashboard sections. Section = separator + heading + rows, collapsible (click on heading)
  - alternate rendering as tabs
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
