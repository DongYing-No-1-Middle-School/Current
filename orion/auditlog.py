"""Login sessions management for Orion"""

import sqlite3
from datetime import time


class AuditLog:
    """Provide basic audit log operations.

    Args:
        oriondb (str): The database name."""

    oriondb = "orion.db"

    def __init__(self, oriondb="orion.db") -> None:
        self.oriondb = oriondb
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "CREATE TABLE IF NOT EXISTS auditlog (time INTENGER, scope TEXT, executer TEXT, message TEXT)"
        c.execute(query)
        conn.commit()
        conn.close()

    def log(self, scope, executer, message) -> None:
        """Log message.

        Args:
            scope (str): The scope.
            executer (str): The executer.
            message (str): The message."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute(
            "INSERT INTO auditlog (time, scope, executer, message) VALUES (?, ?, ?, ?)",
            (int(time.time()), scope, executer, message),
        )
        conn.commit()
        conn.close()

    def get_since(self, since) -> list:
        """Get log messages since a given time.

        Args:
            since (int): The time since.

        Returns:
            list: The log messages."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM auditlog WHERE time >= ?", (since,))
        rows = c.fetchall()
        conn.close()
        return [
            {"time": row[0], "scope": row[1], "executer": row[2], "message": row[3]}
            for row in rows
        ]

    def get_scope(self, scope) -> list:
        """Get log messages for a given scope.

        Args:
            scope (str): The scope.

        Returns:
            list: The log messages."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM auditlog WHERE scope = ?", (scope,))
        rows = c.fetchall()
        conn.close()
        return [
            {"time": row[0], "scope": row[1], "executer": row[2], "message": row[3]}
            for row in rows
        ]

    def get_executer(self, executer) -> list:
        """Get log messages for a given executer.

        Args:
            executer (str): The executer.

        Returns:
            list: The log messages."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM auditlog WHERE executer = ?", (executer,))
        rows = c.fetchall()
        conn.close()
        return [
            {"time": row[0], "scope": row[1], "executer": row[2], "message": row[3]}
            for row in rows
        ]
