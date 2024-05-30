"""Main file of Current app."""

# Import libs
import os
import json
import hashlib
import sqlite3
import uuid

from flask import Flask, request, send_file, render_template
from flask_apscheduler import APScheduler

from orion import user, permissions, sessions
import orion

# Check if installed
if not os.path.exists("config.json"):
    print("Not installed.")
    inst = Flask(__name__)
    inst.app_context().push()
    from routes.install import install
    inst.register_blueprint(install)
    inst.run(host='0.0.0.0')
    exit(0)

# Load config from json file
with open("config.json", encoding='utf-8') as f:
    config = json.load(f)

# Initialize Flask app
app = Flask(__name__)
if config["flask"]["debug"]:
    app.debug = True
app.secret_key = os.urandom(24)

# Initalize OrionDB
oriondb = config["oriondb"]["path"]
app.config["oriondb"] = oriondb
users = orion.Users(oriondb, ['grade', 'classnum'])
sessions = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)

# Push context
app.app_context().push()

# Register routes
from routes.webpage import webpage
app.register_blueprint(webpage)
from routes.clients import clients
app.register_blueprint(clients)

# Register scheduler: NotImplemented
# app.config.from_object(scheduler.Config())
# crontab = APScheduler()
# crontab.init_app(app)
# crontab.start()

if __name__ == "__main__":
    app.run(host='0.0.0.0')
