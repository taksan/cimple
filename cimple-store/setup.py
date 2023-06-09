from setuptools import setup, find_packages

setup(
    name='cimple-store',
    version='1.0.0',
    author='Gabriel Takeuchi',
    author_email='g.takeuchi@gmail.com',
    description='A *very* simple json store',
    url='https://github.com/taksan/cimple/cimple-store',
    license='Apache 2',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    package_data={'': ['*']},
    python_requires='>=3.9',
    entry_points={
        'console_scripts': ['cimple-store=cimple_store.__main__:main'],
    },
    install_requires=['requests==2.30.*', 'fastapi==0.68.1', 'uvicorn==0.15.0', 'python-multipart==0.0.6'],
    extras_require={
        'tests': ['pytest==6.2.*', 'httpx==0.24.0']
    }
)
