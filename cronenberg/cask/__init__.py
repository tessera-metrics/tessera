import json

from .storage import Entity, NamedEntity, EntityEncoder, EntityStorageManager
from .web import WebManagerAdapter

def dumps(data):
    return json.dumps(data, cls=EntityEncoder, indent=4)
