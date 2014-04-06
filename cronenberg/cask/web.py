
from flask import abort

class WebManagerAdapter(object):
    """An adapter for JSON entity managers which adds automatic 404
    handling within a Flask request context."""

    def __init__(self, manager):
        self.manager = manager

    def register_class(self, entity_class):
        return self.manager.register_class(entity_class)

    def load(self, model_type, name, create=False):
        entity = self.manager.load(model_type, name, create=create)
        if entity is None:
            abort(404)
        return entity

    def load_all(self, model_type, pattern=None):
        return self.manager.load_all(model_type, pattern=pattern)

    def store(self, model_type, entity):
        return self.manager.store(model_type, entity)

    def remove(self, model_type, entity_or_name):
        if not self.manager.exists(model_type, entity_or_name):
            abort(404)
        self.manager.remove(model_type, entity_or_name)

    def list(self, model_type, pattern=None):
        return self.manager.list(model_type, pattern=pattern)

    def exists(self, model_type, name):
        return self.manager.exists(model_type, name)
