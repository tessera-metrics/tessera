from datetime import datetime
from ..application import db

# =============================================================================
# Database model
# =============================================================================

class Dashboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    category = db.Column(db.String(40))
    creation_date = db.Column(db.DateTime)
    last_modified_date = db.Column(db.DateTime)

    def __init__(self, title, category, creation_date=None, last_modified_date=None):
        now = datetime.utcnow()
        self.title = title
        self.category = category
        self.creation_date = creation_date or now
        self.last_modified_date = last_modified_date or now
