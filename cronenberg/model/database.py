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

    def __init__(self, title, category,
                 description=None, creation_date=None, last_modified_date=None, imported_from=None,
                 definition=None):
        now = datetime.utcnow()
        self.title = title
        self.category = category
        self.creation_date = creation_date or now
        self.last_modified_date = last_modified_date or now
        self.definition = definition

    def to_json(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'category' : self.category,
            'description' : self.description,
            'creation_date' : self.creation_date.isoformat(),
            'last_modified_date' : self.last_modified_date.isoformat(),
            'imported_from' : self.imported_from
        }

    @classmethod
    def from_json(cls, d):
        return Dashboard(id=d.get('id'),
                         title=d.get('title'),
                         category=d.get('category', None),
                         description=d.get('description', None),
                         creation_date=d.get('creation_date', None),
                         last_modified_datecategory=d.get('last_modified_date', None),
                         imported_fromcategory=d.get('imported_from', None))

class DashboardDef(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dashboard_id = db.Column(db.Integer, db.ForeignKey('dashboard.id'))
    definition = db.Column(db.Text)

    def __init__(self, definition):
        self.definition = definition

    def to_json(self):
        return json.loads(self.definition)
