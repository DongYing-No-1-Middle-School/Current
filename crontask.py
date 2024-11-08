from flask import current_app
from flask_apscheduler import APScheduler

import orion

scheduler = APScheduler()

oriondb = current_app.config["oriondb"]
users = orion.Users(oriondb, ["grade", "classnum", "active"])
session = orion.Sessions(oriondb)
permissions = orion.Permissions(oriondb)


class Config:
    """Scheduler configuration."""

    SCHEDULER_API_ENABLED = True

    JOBS = [
        {
            "id": "sessions_timeout",
            "func": "crontask:sessions_timeout",
            "trigger": "interval",
            "seconds": 10,
        }
    ]


def sessions_timeout():
    """Remove expired sessions."""
    session.purge_expired(30)
