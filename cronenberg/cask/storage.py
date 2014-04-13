import datetime
import os
import os.path
import glob
import json
import logging

log = logging.getLogger(__name__)

DEFAULT_EXTENSION = '.json'

class Entity(object):
    def to_json(self):
        return self.__dict__

    @classmethod
    def from_json(cls, data):
        return cls(**data)

class NamedEntity(Entity):
    def __init__(self, name):
        self.name = name

class EntityEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Entity):
            return obj.to_json()
            # TODO - handle iterables
        elif isinstance(obj, list) or isinstance(obj, tuple):
            return [ self.default(i) for i in obj ]
        elif isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                result[key] = self.default(value)
            return result
        elif hasattr(obj, 'to_json') and callable(getattr(obj, 'to_json')):
            return obj.to_json()
        elif hasattr(obj, '__dict__'):
            return self.default(obj.__dict__)
        else:
            return obj

class EntityStorageManager(object):
    """The EntityStorageManager handles managing the on-disk storage for
    model objects. It uses a simple file per record structure, with
    objects being separated into directories by type.

    Using simple files allows wildcard matching via path globbing and
    simple deployment and versioning, since records are just text
    files of JSON data.

    If data_directory does not exist, it will be created.

    Public API
    * register_class()
    * load()
    * load_all()
    * store()
    * remove()
    * list()
    * exists()

    """
    def __init__(self, data_directory, extension=None):
        self.data_directory = data_directory
        self.model_classes  = {}
        self.extension = extension or DEFAULT_EXTENSION
        if not os.path.exists(data_directory):
            os.makedirs(data_directory)

    def __entity_name(self, path):
        """"Return the name of an entity, given the path to its
        definition file. The name is the filename minus any .json
        extension."""
        filename = os.path.basename(path)
        if filename.endswith(self.extension):
            return filename[:-len(self.extension)]
        else:
            return filename

    @classmethod
    def _entity_type(cls, type_specifier):
        """Normalize the type specifier for an entity, which can be a
        string or the entity class itself."""
        if isinstance(type_specifier, str):
            return type_specifier.lower()
        elif isinstance(type_specifier, unicode):
            return str(type_specifier).lower()
        else:
            return type_specifier.__name__.lower()

    def __entity_directory(self, model_type):
        """Get the storage directory for an entity type."""
        return os.path.join(self.data_directory, EntityStorageManager._entity_type(model_type))

    def __entity_path(self, model_type, entity_or_name):
        """Get the full path to the storage file for a specific entity."""
        if isinstance(entity_or_name, Entity):
            entity_or_name = entity_or_name.name
        return os.path.join(self.data_directory, EntityStorageManager._entity_type(model_type), entity_or_name) + self.extension

    def __load(self, model_type, name):
        """Load the raw JSON data for an entity by name, returning the
        resulting dict object, or None if the entity does not
        exist."""
        path = self.__entity_path(model_type, name)
        if not os.path.exists(path):
            return None
        with open(path, "r") as f:
            return json.load(f)

    def register_class(self, entity_class):
        """Register a new model class, for mapping from JSON data to a
        Python instance. The necessary data directory for storing
        instances of the class will be created. """
        entity_type = EntityStorageManager._entity_type(entity_class)
        self.model_classes[entity_type] = entity_class
        path = self.__entity_directory(entity_type)
        if not os.path.exists(path):
            os.makedirs(path)
        return self

    def load(self, model_type, name, create=False):
        """Load an entity by name, returning an instance of the mapped
        Python class for that entity type."""
        entity_type = EntityStorageManager._entity_type(model_type)
        if not entity_type in self.model_classes:
            log.debug("Unknown entity type %s", entity_type)
            return None

        if name == '\x00':
            return None

        cls = self.model_classes[entity_type]
        data = self.__load(model_type, name)
        if data is None and create:
            log.debug("%s named %s not found, creating it.", entity_type, name)
            entity = cls(name)
            self.store(model_type, entity)
            return entity
        elif data is None:
            log.debug("%s named %s not found.", entity_type, name)
            return None
        else:
            return cls.from_json(name, data)

    def load_all(self, model_type, pattern=None):
        """Load all the entities of a given type matching pattern. If
        no pattern is supplied, all entities of that type will be
        loaded. """
        names = self.list(model_type, pattern)
        return [self.load(model_type, name) for name in names]

    def store(self, model_type, entity):
        """Write an entity to its storage location, overwriting any
        definition that is currently there. """
        path = self.__entity_path(model_type, entity)
        with open(path, "w") as f:
            json.dump(data, f, indent=4, cls=EntityEncoder)

    def remove(self, model_type, entity_or_name):
        """Delete an entity's data file from the backing store."""
        path = self.__entity_path(model_type, entity_or_name)
        os.remove(path)

    def list(self, model_type, pattern=None):
        """List all of the entities of a given type. If pattern is
        None, all entity names will be returned. Pattern can be used
        to restrict the set of names listed to a subset. Standard
        filename globbing syntax can be used to match names."""
        if pattern is None:
            pattern = '*'
        paths = []
        paths.extend(glob.glob(os.path.join(self.data_directory,
                                            EntityStorageManager._entity_type(model_type),
                                            pattern + self.extension)))
        return sorted([self.__entity_name(p) for p in paths if not p.endswith("~")])

    def exists(self, model_type, name):
        """Predicate indicating if a named entity exists in the
        datastore or not."""
        path = self.__entity_path(model_type, name)
        return os.path.exists(path)
