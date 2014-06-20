from contextlib import contextmanager
import os
from shutil import rmtree
from tempfile import mkdtemp

from spec import Spec, skip


@contextmanager
def _tmp():
    try:
        tempdir = mkdtemp()
        yield tempdir
    finally:
        rmtree(tempdir)

@contextmanager
def _db():
    with _tmp() as tempdir:
        from tessera import app, db
        # Temp db location
        path = os.path.join(tempdir, 'tessera.db')
        dbfile = 'sqlite:///{0}'.format(path)
        # Inform app of that location & setup
        app.config.from_object(_config(SQLALCHEMY_DATABASE_URI=dbfile))
        db.create_all()
        # Let test have its way with that temp db
        yield db


class Config(object):
    pass

def _config(**options):
    config = Config()
    for key, value in options.iteritems():
        setattr(config, key, value)


class Tessera(Spec):
    def is_importable(self):
        import tessera
        assert tessera.app
        assert tessera.db

    def creates_a_nonempty_database_schema(self):
        with _db() as db:
            meta = db.MetaData()
            meta.reflect(db.engine)
            assert len(meta.tables) > 0
