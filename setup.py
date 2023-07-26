from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in calendar_app/__init__.py
from calendar_app import __version__ as version

setup(
	name="calendar_app",
	version=version,
	description="simple calendar app using frappe + react",
	author="kush",
	author_email="kush.mistry@mobiosolutions.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
