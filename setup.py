from setuptools import setup, find_packages

name = 'tessera'
_locals = {}
execfile('%s/_version.py' % name, _locals)
version = _locals['__version__']

setup(
    name=name,
    version=version,
    description='Powerful multipurpose dashboard server',
    license='Apache',

    author='Urban Airship',
    url='https://github.com/urbanairship/tessera',

    packages=find_packages(),
    include_package_data=True, # Ensure templates, etc get pulled into sdists
    install_requires=[
        x.strip()
        for x in open('requirements.txt').readlines()
        if x and not x.startswith('#')
    ],

    entry_points = {
        'console_scripts': [
            'tessera = tessera.main:run'
        ]
    },

    classifiers=[
        'Development Status :: 3 - Alpha',
        'Environment :: No Input/Output (Daemon)',
        'Framework :: Flask',
        'Intended Audience :: Developers',
        'Intended Audience :: Information Technology',
        'Intended Audience :: System Administrators',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: MacOS :: MacOS X',
        'Operating System :: POSIX',
        'Operating System :: Unix',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python',
        'Topic :: System :: Monitoring',
        'Topic :: System :: Systems Administration',
    ],
)
