from setuptools import setup, find_packages

name = 'tessera'
_locals = {}
execfile('%s/_version.py' % name, _locals)
version = _locals['__version__']

setup(
    name=name,
    version=version,
    packages=find_packages(),
    # Ensure templates, etc get pulled into sdists
    include_package_data=True,
    install_requires=[
        x.strip()
        for x in open('requirements.txt').readlines()
        if x and not x.startswith('#')
    ],
)
