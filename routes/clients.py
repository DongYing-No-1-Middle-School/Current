"""Route of clients (login, sessions...)."""
from flask import Blueprint, current_app, request

import orion

clients = Blueprint("clients", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ['grade', 'classnum'])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)

@clients.route("/api/clients/login", methods=["POST"])
def login():
    """Login via username and password"""
    try:
        username = request.json["username"]
        password = request.json["password"]
    except KeyError:
        return {
            "code": 400,
            "success": False,
            "message": "Bad request."
        }
    state = users.verify(username, password)
    if state:
        token = sessions.create(username)
        return {
            "code": 200,
            "success": True,
            "data": {
                "token": token
            }
        }
    else:
        return {
            "code": 401,
            "success": False,
            "message": "Wrong username or password."
       }

@clients.route("/api/clients/status", methods=["GET"])
def status():
    """Return if client login state is valid"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {
            "code": 400,
            "success": False,
            "message": "Bad request."
        }
    username = sessions.get_user(token)
    if username:
        return {
            "code": 200,
            "success": True,
            "data": {
                "username": username
            }
        }
    else:
        return {
            "code": 401,
            "success": False,
            "message": "Invalid token."
        }

@clients.route("/api/clients/logout", methods=["GET"])
def logout():
    """Logout"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {
            "code": 400,
            "success": False,
            "message": "Bad request."
        }
    sessions.delete(token)
    return {
        "code": 200,
        "success": True
    }