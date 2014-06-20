from spec import Spec, skip


class Tessera(Spec):
    def is_importable(self):
        import tessera
        assert tessera.app
        assert tessera.db
