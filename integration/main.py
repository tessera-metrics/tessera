import os
import sys

from spec import Spec, skip
from invoke import run


class Integration(Spec):
    def setup(self):
        from tessera.application import db
        # Ensure we have a clean db target.
        self.dbpath = db.engine.url.database
        msg = "You seem to have a db in the default location ({0}) - please (re)move it before running tests to avoid collisions."
        assert not os.path.exists(self.dbpath), msg.format(self.dbpath)

    def teardown(self):
        # Teardown only runs if setup completed, so the below will not nuke
        # pre-existing dbs that cause setup's check to fail.
        if os.path.exists(self.dbpath):
            os.remove(self.dbpath)

    def is_importable(self):
        import tessera
        assert tessera.app
        assert tessera.db

    def can_initdb(self):
        from tessera.application import db
        from tessera.model.database import Dashboard
        # Make sure we can create and look at the DB
        db.create_all()
        assert len(Dashboard.query.all()) == 0
