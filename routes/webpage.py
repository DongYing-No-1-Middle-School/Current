"""Route of web pages."""

from flask import Blueprint, current_app, render_template, send_file

import orion

webpage = Blueprint("webpage", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum", "active"])
session = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)
auditlog = orion.AuditLog(oriondb)
configuration = orion.Configuration(oriondb)


VersionNumber = "1.0.2"


@webpage.route("/")
def index():
    """Index page."""
    return render_template("index.html")


@webpage.route("/favicon.ico")
def favicon():
    return send_file("static/img@1.0.0/current.ico")


@webpage.route("/login")
def login():
    """Login page."""
    return render_template("login.html")


@webpage.route("/drafts")
def draft():
    """Draft page."""
    return render_template("drafts.html")


@webpage.route("/settings")
def settings():
    """Personal settings page."""
    return render_template("settings.html", version_number=VersionNumber)


@webpage.route("/issue/<int:issue_id>")
def issue(issue_id):
    """Issue page."""
    return render_template("issue.html", issue_id=issue_id)


@webpage.route("/issue/_example")
def issue_example():
    """Issue example page."""
    return render_template("issue_example.html")


@webpage.route("/issue/<int:issue_id>/create")
def new_entry(issue_id):
    """New entry page."""
    return render_template("newentry.html", issue_id=issue_id)
