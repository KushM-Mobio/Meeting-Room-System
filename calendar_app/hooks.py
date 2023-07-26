from . import __version__ as app_version

app_name = "calendar_app"
app_title = "Calendar App"
app_publisher = "kush"
app_description = "simple calendar app using frappe + react"
app_email = "kush.mistry@mobiosolutions.com"
app_license = "MIT"

# URL routes
website_route_rules = [
    # Add your custom API route here
    {"from_route": "/api/meeting_room_types", "to_route": "calendar_app.api.get_meeting_room_type"}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/calendar_app/css/calendar_app.css"
# app_include_js = "/assets/calendar_app/js/calendar_app.js"

# include js, css files in header of web template
# web_include_css = "/assets/calendar_app/css/calendar_app.css"
# web_include_js = "/assets/calendar_app/js/calendar_app.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "calendar_app/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "calendar_app.utils.jinja_methods",
#	"filters": "calendar_app.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "calendar_app.install.before_install"
# after_install = "calendar_app.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "calendar_app.uninstall.before_uninstall"
# after_uninstall = "calendar_app.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "calendar_app.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"calendar_app.tasks.all"
#	],
#	"daily": [
#		"calendar_app.tasks.daily"
#	],
#	"hourly": [
#		"calendar_app.tasks.hourly"
#	],
#	"weekly": [
#		"calendar_app.tasks.weekly"
#	],
#	"monthly": [
#		"calendar_app.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "calendar_app.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "calendar_app.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "calendar_app.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["calendar_app.utils.before_request"]
# after_request = ["calendar_app.utils.after_request"]

# Job Events
# ----------
# before_job = ["calendar_app.utils.before_job"]
# after_job = ["calendar_app.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"calendar_app.auth.validate"
# ]

website_route_rules = [{'from_route': '/frontend/<path:app_path>', 'to_route': 'frontend'},]