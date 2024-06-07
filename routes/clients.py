"""Route of clients (login, sessions...)."""

from flask import Blueprint, current_app, request

import orion

clients = Blueprint("clients", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum"])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)


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
        return {"code": 200, "success": True, "data": {"token": token}}
    else:
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
    sessions.delete(token)
    return {"code": 200, "success": True}
