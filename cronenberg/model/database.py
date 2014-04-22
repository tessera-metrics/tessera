import json
from datetime import datetime
from ..application import db
from .web import EntityEncoder

# =============================================================================
# Database model
# =============================================================================

class Dashboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    category = db.Column(db.String(40))
    description = db.Column(db.String(200))
    creation_date = db.Column(db.DateTime)
    imported_from = db.Column(db.String(200))
    last_modified_date = db.Column(db.DateTime)
    definition = db.relationship('DashboardDef', uselist=False, backref='dashboard')
    tags = db.relationship('Tag',
                           secondary=lambda: dashboard_tags,
                           backref=db.backref('dashboards', lazy='dynamic'),
                           lazy='joined')

    def __init__(self, title, category=None,
                 description=None, creation_date=None, last_modified_date=None, imported_from=None,
                 definition=None,
                 tags=None):
        now = datetime.utcnow()
        self.title = title
        self.category = category
        self.creation_date = creation_date or now
        self.last_modified_date = last_modified_date or now
        self.definition = definition
        self.description = description
        self.imported_from = imported_from
        self.tags = tags or []

    def to_json(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'category' : self.category,
            'description' : self.description,
            'creation_date' : self.creation_date.isoformat() + 'Z',
            'last_modified_date' : self.last_modified_date.isoformat() + 'Z',
            'imported_from' : self.imported_from,
            'tags' : self.tags
        }

    def merge_from_json(self, d):
        for attr in ['title', 'category', 'description', 'imported_from']:
            if hasattr(self, attr):
                setattr(self, attr, d[attr])

    @classmethod
    def from_json(cls, d):
        return Dashboard(title=d.get('title'),
                         category=d.get('category', None),
                         description=d.get('description', None),
                         imported_from=d.get('imported_from', None))

class DashboardDef(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dashboard_id = db.Column(db.Integer, db.ForeignKey('dashboard.id'))
    definition = db.Column(db.Text)

    def __init__(self, definition):
        self.definition = definition

    def to_json(self):
        return json.loads(self.definition)

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

    def __init__(self, name, description=None):
        self.name = name
        self.description = description

    def to_json(self):
        return {
            'id' : self.id,
            'name' : self.name,
            'description' : self.description
        }

    @classmethod
    def from_json(cls, data):
        return Tag(**data)

dashboard_tags = db.Table('dashboard_tags',
                          db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
                          db.Column('dashboard_id', db.Integer, db.ForeignKey('dashboard.id')))


# =============================================================================
# Manager
# =============================================================================

class DatabaseManager(object):
    def __init__(self, db):
        self.db = db

    def canonicalize_tag(self, tag):
        return Tag.query.filter_by(name=tag.name).first() or tag

    def store_dashboard(self, d):
        # There's undoubtedly a better way to do this
        if d.tags:
            d.tags = [self.canonicalize_tag(t) for t in d.tags]
        d.last_modified_date = datetime.utcnow()
        db.session.add(d)
        db.session.commit()
