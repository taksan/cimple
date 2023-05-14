from setuptools import setup, find_packages

setup(
    name='cimple-collector',
    version='0.1.0',
    author='Gabriel Takeuchi',
    author_email='g.takeuchi@gmail.com',
    description='The cimple backend',
    url='https://github.com/taksan/cimple/cimple-eviewer-collector',
    license='Apache 2',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    package_data={'': ['*']},
    python_requires='>=3.9',
    entry_points={
        'console_scripts': ['cimple-collector=cimple_collector.__main__:main'],
    },
    install_requires=['requests==2.30.*', 'pyinotify==0.9.6'],
    extras_require={
        'tests': ['pytest==7.3.*','pytest-asyncio==0.21.0','pytest-mock==3.10.0']
    }
)
