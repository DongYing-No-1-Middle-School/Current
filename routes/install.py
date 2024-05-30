import json
import sqlite3
from flask import Blueprint, current_app, request, render_template

import orion

install = Blueprint("install", __name__, template_folder="templates")

oriondb = 'orion.db'
nowstep = 0
users = session = permissions = None

@install.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        global nowstep
        step = request.json["step"]
        if step == 0:
            return {"code": 200, "success": True, "step": nowstep}
        if step == 1:
            global oriondb
            oriondb = request.json["oriondb"]
            config_template = {
                "flask": {
                    "debug": False,
                },
                "oriondb": {
                    "path": oriondb
                }
            }
            with open("config.json", "w") as f:
                f.write(json.dumps(config_template, indent=4))
            nowstep = 2
            return {"code": 200, "success": True}
        if step == 2:
            global users, session, permissions
            users = orion.Users(oriondb, ['grade', 'classnum'])
            session = orion.Sessions(oriondb)
            permissions = orion.Permissions(oriondb)
            conn = sqlite3.connect('current.db')
            c = conn.cursor()
            c.execute("""create table issues
            (
                id          integer
                    constraint issues_pk
                        primary key,
                date        integer,
                subject2    text,
                subject3    text,
                subject4    text,
                leader      text,
                editors     text,
                respeditors text
            );""")
            c.execute("""create table entries
            (
                uuid        text,
                issue_id    integer,
                page        integer,
                title       text,
                origin      text,
                description text,
                author      text,
                action      text,
                constraint entries_pk
                    primary key (uuid)
            );""")
            nowstep = 3
            return {"code": 200, "success": True}
        if step == 3:
            username = request.json["username"]
            password = request.json["password"]
            grade = int(request.json["grade"])
            classnum = int(request.json["classnum"])
            users.create(username, password, grade=grade, classnum=classnum)
            permissions.grant(username, "group.default")
            permissions.grant(username, "*")
            nowstep = 4
            return {"code": 200, "success": True}
    return render_template("install/install.html")
