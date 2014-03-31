#!/usr/bin/env python

from cronenberg import app
from flask.ext.script import Manager

manager = Manager(app)

@manager.command
def run():
    app.run(host='0.0.0.0')

if __name__ == '__main__':
    manager.run()
