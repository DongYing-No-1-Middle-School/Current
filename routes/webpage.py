"""Route of web pages."""
from flask import Blueprint, current_app, render_template

import orion

webpage = Blueprint("webpage", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ['grade', 'classnum'])
session = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)

@webpage.route("/")
def index():
    """Index page."""
    return render_template("index.html")

@webpage.route("/login")
def login():
    """Login page."""
    return render_template("login.html")

@webpage.route("/settings")
def settings():
    """Personal settings page."""
    return render_template("settings.html")

@webpage.route("/issue/<int:issue_id>")
def issue(issue_id):
    """Issue page."""
    return render_template("issue.html", issue_id=issue_id)

@webpage.route("/issue/<int:issue_id>/create")
def new_entry(issue_id):
    """New entry page."""
    return render_template("newentry.html", issue_id=issue_id)