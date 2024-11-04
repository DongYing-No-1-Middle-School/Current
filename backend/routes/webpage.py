"""Route of web pages."""

from flask import Blueprint, current_app, render_template, send_file
import requests

import orion

webpage = Blueprint("webpage", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum", "active"])
session = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)
auditlog = orion.AuditLog(oriondb)
configuration = orion.Configuration(oriondb)


VersionNumber = "1.0.4"

"""Github Changelog Fetch"""
GITHUB_USERNAME = "DongYing-No-1-Middle-School"
REPO_NAME = "Current"
# ACCESS_TOKEN = ""
url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{REPO_NAME}/commits"
headers = {
    # "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}


def fetch_commits():
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching commits: {response.status_code}")
        return []


def format_commit(commit):
    sha = commit["sha"][:7]  # 获取前7位哈希
    message = commit["commit"]["message"].split("\n")[0]  # 获取提交信息的第一行
    date = commit["commit"]["committer"]["date"][
        :10
    ]  # 获取提交日期（格式：YYYY-MM-DD）
    return f"<p>{sha} - {date} - {message}</p>"


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
    commits = fetch_commits()
    changelog = ''.join(format_commit(commit) for commit in commits)
    return render_template("settings.html", version_number=VersionNumber, changelog=changelog)


@webpage.route("/issue/new")
def newissue():
    """Issue page."""
    return render_template("newissue.html")


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
