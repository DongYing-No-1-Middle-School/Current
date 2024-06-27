"""All scripts for /management (Backend / Frontend)"""

from flask import Blueprint, current_app, render_template, make_response, request, redirect
import sqlite3
import uuid
import time

import orion

management = Blueprint("management", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum"])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)
auditlog = orion.AuditLog(oriondb)
configuration = orion.Configuration(oriondb)

def get_sudo_user(token):
    """Check if user has sudo mode enabled"""
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute("select * from sudo where token = ?", (token,))
    sudo_user = c.fetchone()
    if not sudo_user:
        conn.close()
        return None
    elif sudo_user[2] < int(time.time()) - 3600:
        c.execute("delete from sudo where token = ?", (token,))
        conn.commit()
        conn.close()
        return None
    c.execute("update sudo set activitytime = ? where token = ?", (int(time.time()), token))
    conn.commit()
    conn.close()
    return sudo_user

def make_token_response(response, cookie):
    """Make a response with a token"""
    res = make_response(response)
    res.set_cookie("sudo_token", cookie, httponly=True, max_age=3600, samesite="Strict")
    return res

@management.route("/management")
def index():
    """Index page of /management"""
    # Check if user has entered sudo mode
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return redirect("/sudo?redirect=/management")
    sudo_user = get_sudo_user(token)
    if not sudo_user:
        return redirect("/sudo?redirect=/management")
    return make_token_response(render_template("management.html"), token)

@management.route("/management/users")
def userman():
    """Users page"""
    # Check if user has entered sudo mode
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return redirect("/sudo?redirect=/management/users")
    sudo_user = get_sudo_user(token)
    if not sudo_user:
        return redirect("/sudo?redirect=/management/users")
    return make_token_response(render_template("management_users.html"), token)

@management.route("/sudo")
def sudo():
    """Sudo page"""
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return render_template("sudo.html")
    sudo_user = get_sudo_user(token)
    if not sudo_user:
        return render_template("sudo.html")
    return redirect("/management")

@management.route("/api/management/sudo", methods=["POST"])
def sudo_login():
    """Login to sudo"""
    try:
        token = request.headers["Authorization"]
        password = request.json["password"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not permissions.has_permission(username, "management"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(management)",
        }
    state = users.verify(username, password)
    if state:
        conn = sqlite3.connect("current.db")
        c = conn.cursor()
        sudo_token = str(uuid.uuid4())
        c.execute("insert into sudo (token, user, activitytime) values (?, ?, ?)", (sudo_token, username, int(time.time())))
        conn.commit()
        conn.close()
        auditlog.log("management", username, "Logged in to sudo mode.")
        return make_token_response({"code": 200, "success": True}, sudo_token)
    else:
        auditlog.log("management", username, "Failed sudo attempt.")
        return {"code": 401, "success": False, "message": "Wrong password."}

@management.route("/api/management/logout")
def sudo_logout():
    """Logout from sudo"""
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    auditlog.log("management", get_sudo_user(token)[1], "Logged out from sudo mode.")
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute("delete from sudo where token = ?", (token,))
    conn.commit()
    conn.close()
    return make_token_response({"code": 200, "success": True}, "")

@management.route("/api/management/announcement/update", methods=["POST"])
def update_announcement():
    """Update announcement"""
    try:
        token = request.cookies["sudo_token"]
        content = request.form["content"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    auditlog.log("management", get_sudo_user(token)[1], "Updated announcement.")
    configuration.update("site.announcement", content.replace("\n", "<br>"))
    try:
        pdf = request.files["pdf"]
        pdf.save(f"uploads/{pdf.filename}")
        configuration.update("site.announcementpdf", pdf.filename)
    except KeyError:
        configuration.update("site.announcementpdf", "")
    return {"code": 200, "success": True}

@management.route("/api/management/users/list", methods=["GET"])
def list_users():
    """List all users"""
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    sudo_user = get_sudo_user(token)
    if not sudo_user:
        return {"code": 401, "success": False, "message": "Invalid token."}
    return {"code": 200, "success": True, "data": users.listall()}

@management.route("/api/management/entries/list", methods=["GET"])
def list_entries():
    """List all entries"""
    try:
        token = request.cookies["sudo_token"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    sudo_user = get_sudo_user(token)
    if not sudo_user:
        return {"code": 401, "success": False, "message": "Invalid token."}
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute("select * from entries")
    allentries = c.fetchall()
    conn.close()
    res = []
    for entry in allentries:
        res.append(
            {
                "id": entry[0],
                "date": entry[1],
                "subject": entry[2],
                "content": entry[3],
                "author": entry[4],
                "ispublic": entry[5],
            }
        )
    return {"code": 200, "success": True, "data": res}