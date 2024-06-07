"""Routes of entries (create, upload, review, select...)"""

import sqlite3
import time
import uuid

from flask import Blueprint, current_app, request, send_file

import orion

entries = Blueprint("entries", __name__, template_folder="templates")

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum"])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)


@entries.route("/api/entries/create", methods=["POST"])
def create():
    """Create an entry"""
    try:
        token = request.headers["Authorization"]
        issue_id = request.json["issue_id"]
        page = request.json["page"]
        title = request.json["title"]
        origin = request.json["origin"]
        wordcount = request.json["wordcount"]
        description = request.json["description"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    try:
        description = request.json["description"]
    except KeyError:
        description = ""
    if not permissions.has_permission(
        sessions.get_user(token), f"entries.create.{issue_id}"
    ):
        return {
            "code": 403,
            "success": False,
            "message": f"Access denied by permission controller: IsGranted(entries.create.{issue_id})",
        }
    entry_uuid = str(uuid.uuid4())
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute(
        """insert into entries (uuid, issue_id, filename, page, title, origin, wordcount, description, selector, reviewer, status)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);""",
        (
            entry_uuid,
            issue_id,
            "",
            page,
            title,
            origin,
            wordcount,
            description,
            sessions.get_user(token),
            "",
            "pending",
        ),
    )
    c.close()
    conn.commit()
    conn.close()
    return {
        "code": 200,
        "success": True,
        "data": {
            "uuid": entry_uuid,
            "issue_id": issue_id,
            "filename": "",
            "page": page,
            "title": title,
            "origin": origin,
            "wordcount": wordcount,
            "description": description,
            "selector": sessions.get_user(token),
            "reviewer": "",
            "status": "pending",
        },
    }


@entries.route("/api/entries/upload/<entry_uuid>", methods=["POST"])
def upload(entry_uuid):
    """Upload a file to an entry"""
    try:
        token = request.headers["Authorization"]
        file = request.files["file"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute(
        "select * from entries where uuid = ?",
        (entry_uuid,),
    )
    entry = c.fetchone()
    if not entry:
        conn.close()
        return {"code": 404, "success": False, "message": "Entry not found."}
    issue_id = entry[1]
    if not permissions.has_permission(
        sessions.get_user(token), f"entries.create.{issue_id}"
    ):
        return {
            "code": 403,
            "success": False,
            "message": f"Access denied by permission controller: IsGranted(entries.create.{issue_id})",
        }
    file.save(f"uploads/{entry_uuid}")
    c.execute(
        "update entries set filename = ?, status = 'created' where uuid = ?",
        (file.filename, entry_uuid),
    )
    conn.commit()
    conn.close()
    return {
        "code": 200,
        "success": True,
        "data": {
            "uuid": entry_uuid,
            "issue_id": issue_id,
            "filename": file.filename,
            "page": entry[3],
            "title": entry[4],
            "origin": entry[5],
            "wordcount": entry[6],
            "description": entry[7],
            "selector": entry[8],
            "reviewer": entry[9],
            "status": "created",
        },
    }


@entries.route('/api/entries/listissue/<issue_id>')
def listissue(issue_id):
    """List entries of an issue"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    if not permissions.has_permission(
        sessions.get_user(token), f"entries.list.{issue_id}"
    ):
        return {
            "code": 403,
            "success": False,
            "message": f"Access denied by permission controller: IsGranted(entries.list.{issue_id})",
        }
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute("select * from entries where issue_id = ?", (issue_id,))
    allentries = c.fetchall()
    conn.close()
    res = []
    entries_cnt = [
        {
            "pending": 0,
            "created": 0,
            "reviewed": 0,
            "selected": 0,
        },
        {
            "pending": 0,
            "created": 0,
            "reviewed": 0,
            "selected": 0,
        },
        {
            "pending": 0,
            "created": 0,
            "reviewed": 0,
            "selected": 0,
        },
        {
            "pending": 0,
            "created": 0,
            "reviewed": 0,
            "selected": 0,
        }
    ]
    for entry in allentries:
        res.append(
            {
                "uuid": entry[0],
                "issue_id": entry[1],
                "filename": entry[2],
                "page": entry[3],
                "title": entry[4],
                "origin": entry[5],
                "wordcount": entry[6],
                "description": entry[7],
                "selector": entry[8],
                "reviewer": entry[9],
                "status": entry[10],
            }
        )
        entries_cnt[entry[3] - 1][entry[10]] += 1
    return {
        "code": 200,
        "success": True,
        "data": {
            "list": res,
            "count": entries_cnt,
        },
    }


@entries.route("/api/entries/review/<entry_uuid>", methods=["POST"])
def review(entry_uuid):
    """Review an entry"""
    try:
        token = request.headers["Authorization"]
        file = request.files["file"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute(
        "select * from entries where uuid = ?",
        (entry_uuid,),
    )
    entry = c.fetchone()
    if not entry:
        conn.close()
        return {"code": 404, "success": False, "message": "Entry not found."}
    issue_id = entry[1]
    if not permissions.has_permission(
        sessions.get_user(token), f"entries.review.{issue_id}"
    ):
        return {
            "code": 403,
            "success": False,
            "message": f"Access denied by permission controller: IsGranted(entries.review.{issue_id})",
        }
    file.save(f"uploads/{entry_uuid}")
    c.execute(
        "update entries set filename = ?, status = 'reviewed', reviewer = ? where uuid = ?",
        (file.filename, sessions.get_user(token), entry_uuid),
    )
    conn.commit()
    conn.close()
    return {
        "code": 200,
        "success": True,
        "data": {
            "uuid": entry_uuid,
            "issue_id": issue_id,
            "filename": file.filename,
            "page": entry[3],
            "title": entry[4],
            "origin": entry[5],
            "wordcount": entry[6],
            "description": entry[7],
            "selector": entry[8],
            "reviewer": sessions.get_user(token),
            "status": "reviewed",
        },
    }


@entries.route("/api/entries/getasset/<entry_uuid>", methods=["GET"])
def getasset(entry_uuid):
    """Get the asset of an entry"""
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute(
        "select * from entries where uuid = ?",
        (entry_uuid,),
    )
    entry = c.fetchone()
    if not entry:
        conn.close()
        return {"code": 404, "success": False, "message": "Entry not found."}
    conn.close()
    return send_file(f"uploads/{entry_uuid}", as_attachment=True, download_name=entry[2])


@entries.route("/api/entries/select/<entry_uuid>", methods=["POST"])
def select(entry_uuid):
    """Select an entry"""
    try:
        token = request.headers["Authorization"]
    except KeyError:
        return {"code": 400, "success": False, "message": "Bad request."}
    conn = sqlite3.connect("current.db")
    c = conn.cursor()
    c.execute(
        "select * from entries where uuid = ?",
        (entry_uuid,),
    )
    entry = c.fetchone()
    if not entry:
        conn.close()
        return {"code": 404, "success": False, "message": "Entry not found."}
    issue_id = entry[1]
    if not permissions.has_permission(
        sessions.get_user(token), f"entries.select.{issue_id}"
    ):
        return {
            "code": 403,
            "success": False,
            "message": f"Access denied by permission controller: IsGranted(entries.select.{issue_id})",
        }
    if entry[10] == "created":
        conn.close()
        return {"code": 400, "success": False, "message": "Entry not reviewed."}
    if entry[10] == "selected":
        c.execute(
            "update entries set status = 'reviewed' where uuid = ?",
            (entry_uuid,),
        )
        status = "reviewed"
    else:
        c.execute(
            "update entries set status = 'selected' where uuid = ?",
            (entry_uuid,),
        )
        status = "selected"
    conn.commit()
    conn.close()
    return {
        "code": 200,
        "success": True,
        "data": {
            "uuid": entry_uuid,
            "issue_id": issue_id,
            "filename": entry[2],
            "page": entry[3],
            "title": entry[4],
            "origin": entry[5],
            "wordcount": entry[6],
            "description": entry[7],
            "selector": entry[8],
            "reviewer": entry[9],
            "status": status,
        },
    }
