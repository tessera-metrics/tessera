import os
import sys

from spec import Spec, skip, eq_
from invoke import run


class Integration(Spec):
    def setup(self):
        from tessera.application import db
        # Ensure we have a clean db target.
        self.dbpath = db.engine.url.database
        msg = "You seem to have a db in the default location ({0}) - please (re)move it before running tests to avoid collisions."
        assert not os.path.exists(self.dbpath), msg.format(self.dbpath)

    def teardown(self):
        from tessera.application import db
        # Teardown only runs if setup completed, so the below will not nuke
        # pre-existing dbs that cause setup's check to fail.
        if os.path.exists(self.dbpath):
            os.remove(self.dbpath)
        # Ensure no cached session crap
        db.session.close_all()


    def is_importable(self):
        import tessera
        assert tessera.app
        assert tessera.db

    def can_initdb(self):
        from tessera.application import db
        from tessera.database import DashboardRecord
        # Make sure we can create and look at the DB
        db.create_all()
        eq_(len(DashboardRecord.query.all()), 0)

#    def can_import_fixtures(self):
#        from tessera.application import db
#        from tessera.importer.json import JsonImporter
#        from tessera.database import DashboardRecord
#        db.create_all()
#        path = os.path.abspath(os.path.join(
#            os.path.dirname(__file__), '..', 'demo', 'demo-gallery.json'
#        ))
#        JsonImporter.import_file(path)
#        eq_(len(DashboardRecord.query.all()), 1)
