"""Route of clients (login, sessions...)."""

from flask import Blueprint, current_app, request, send_file

import orion

clients = Blueprint("clients", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum", "active"])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)
auditlog = orion.AuditLog(oriondb)
configuration = orion.Configuration(oriondb)


@clients.route("/api/clients/login", methods=["POST"])
def login():
    """Login via username and password"""
    try:
        username = request.json["username"]
        password = request.json["password"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    if not permissions.has_permission(username, "clients.login"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(clients.login)",
        }
    state = users.verify(username, password)
    if state:
        token = sessions.create(username)
        auditlog.log("clients.login", sessions.get_user(token), "New login session.")
        return {"code": 200, "success": True, "data": {"token": token}}
    else:
        auditlog.log("clients.login", username, "Failed login attempt.")
        return {"code": 401, "success": False, "message": "Wrong username or password."}


@clients.route("/api/clients/status", methods=["GET"])
def status():
    """Return if client login state is valid"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not permissions.has_permission(username, "clients.login"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(clients.login)",
        }
    if username:
        userdetail = users.get_by_name(username)
        return {
            "code": 200,
            "success": True,
            "data": {
                "username": username,
                "grade": userdetail["grade"],
                "classnum": userdetail["classnum"],
                "active": userdetail["active"],
            },
        }
    return {"code": 401, "success": False, "message": "Invalid token."}


@clients.route("/api/clients/permissions", methods=["GET"])
def get_permissions():
    """Get permissions"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not username:
        return {"code": 401, "success": False, "message": "Invalid token."}
    return {
        "code": 200,
        "success": True,
        "data": permissions.list_permissions(username),
    }


@clients.route("/api/clients/logout", methods=["GET"])
def logout():
    """Logout"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    auditlog.log("clients.logout", sessions.get_user(token), "Logout a session.")
    sessions.delete(token)
    return {"code": 200, "success": True}


@clients.route("/api/clients/changepass", methods=["POST"])
def changepass():
    """Change password"""
    try:
        token = request.headers["Authorization"]
        oldpass = request.json["oldpass"]
        newpass = request.json["newpass"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not permissions.has_permission(username, "clients.changepass"):
        return {
            "code": 403,
            "success": False,
            "message": "Access denied by permission controller: IsGranted(clients.changepass)",
        }
    if not username:
        return {"code": 401, "success": False, "message": "Invalid token."}
    if not users.verify(username, oldpass):
        return {"code": 401, "success": False, "message": "Wrong old password."}
    users.update(username, passwd=newpass)
    auditlog.log(
        "clients.changepass",
        sessions.get_user(username),
        f"Password changed for {username}",
    )
    sessions.purge_user(username)
    return {"code": 200, "success": True}


@clients.route("/api/clients/getannouncement", methods=["GET"])
def getannouncement():
    """Get announcement"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not username:
        return {"code": 401, "success": False, "message": "Invalid token."}
    if configuration.get("site.announcementpdf", default="") != "":
        show_pdf = True
    else:
        show_pdf = False
    return {
        "code": 200,
        "success": True,
        "data": {
            "content": configuration.get("site.announcement", default="站点公告可在管理面板修改。"),
            "show_pdf": show_pdf,
        }
    }


@clients.route("/api/clients/getannouncementpdf", methods=["GET"])
def getannouncementpdf():
    """Get announcement pdf"""
    try:
        token = request.args["token"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    username = sessions.get_user(token)
    if not username:
        return {"code": 401, "success": False, "message": "Invalid token."}
    return send_file(
        f"uploads/{configuration.get('site.announcementpdf', default='404.pdf')}",
        as_attachment=False,
    )
