from flask import current_app
from flask_apscheduler import APScheduler

import orion

scheduler = APScheduler()

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum"])
session = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)


class Config:
    SCHEDULER_API_ENABLED = True

    JOBS = [
        {
            "id": "sessions_timeout",
            "func": "scheduler:sessions_timeout",
            "trigger": "interval",
            "seconds": 10,
        }
    ]


def sessions_timeout():
    """Remove expired sessions."""
    session.purge_expired(30)
