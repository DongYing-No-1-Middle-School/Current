"""Route of issues (create, publish...)."""

import sqlite3
import time

from flask import Blueprint, current_app, request

import orion

issues = Blueprint("issues", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum"])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)


@issues.route("/api/issues/create", methods=["POST"])
def create():
    """Create an issue"""
    try:
        token = request.headers["Authorization"]
        issue_id = request.json["issue_id"]
        date = request.json["date"]
        subject2 = request.json["subject"][0]
        subject3 = request.json["subject"][1]
        subject4 = request.json["subject"][2]
        leader = request.json["leader"]
        editors = ",".join(request.json["editors"])
        respeditor = request.json["respeditor"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    if not permissions.has_permission(sessions.get_user(token), "issues.create"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(issues.create)",
        }
    if date < int(time.time()):
        return {"code": 400, "success": False, "message": "Invalid date."}
    conn = sqlite3.connect('current.db')
    c = conn.cursor()
    c.execute(
        """insert into issues 
              (id, date, subject2, subject3, subject4, leader, editors, respeditor, ispublished) 
              values (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
        (issue_id, date, subject2, subject3, subject4, leader, editors, respeditor),
    )
    conn.commit()
    conn.close()
    return {"code": 200, "success": True}

@issues.route("/api/issues/list", methods=["GET"])
def listall():
    """List issues"""
    conn = sqlite3.connect('current.db')
    c = conn.cursor()
    c.execute("select * from issues")
    allissues = c.fetchall()
    conn.close()
    res = []
    for issue in allissues:
        res.append(
            {
                "id": issue[0],
                "date": issue[1],
                "subject": [issue[2], issue[3], issue[4]],
                "leader": issue[5],
                "editors": issue[6].split(","),
                "respeditor": issue[7],
                "ispublished": issue[8],
            }
        )
    return {"code": 200, "success": True, "data": res}

@issues.route("/api/issues/info/<issue_id>", methods=["GET"])
def info(issue_id):
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    conn = sqlite3.connect('current.db')
    c = conn.cursor()
    c.execute("select * from issues where id = ?", (issue_id,))
    issue = c.fetchone()
    conn.close()
    if not issue:
        return {"code": 404, "success": False, "message": "Issue not found."}
    return {
        "code": 200,
        "success": True,
        "data": {
            "id": issue[0],
            "date": issue[1],
            "subject": [issue[2], issue[3], issue[4]],
            "leader": issue[5],
            "editors": issue[6].split(","),
            "respeditor": issue[7],
            "ispublished": issue[8],
        },
    }

@issues.route("/api/issues/publish/<issue_id>", methods=["POST"])
def publish(issue_id):
    """Publish an issue with pdf upload"""
    try:
        token = request.headers["Authorization"]
        pdf = request.files["pdf"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    if not permissions.has_permission(sessions.get_user(token), "issues.publish"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(issues.publish)",
        }
    conn = sqlite3.connect('current.db')
    c = conn.cursor()
    c.execute("select * from issues where id = ?", (issue_id,))
    issue = c.fetchone()
    if not issue:
        conn.close()
        return {"code": 404, "success": False, "message": "Issue not found."}
    pdf.save(f"uploads/issues/{issue_id}.pdf")
    c.execute("update issues set ispublished = 1 where id = ?", (issue_id,))
    conn.commit()
    conn.close()
