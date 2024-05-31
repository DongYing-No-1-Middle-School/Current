"""Login sessions management for Orion"""

import sqlite3
import uuid
import time


class Sessions:
    """Provide basic session operations.

    Args:
        oriondb (str): The database name."""

    oriondb = "orion.db"

    def __init__(self, oriondb="orion.db") -> None:
        self.oriondb = oriondb
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "CREATE TABLE IF NOT EXISTS sessions (session TEXT, user TEXT, created_at INTEGER)"
        c.execute(query)
        conn.commit()
        conn.close()

    def create(self, user) -> str:
        """Create session.

        Args:
            user (str): The user.

        Returns:
            str: The session."""
        session = str(uuid.uuid4())
        created_at = int(time.time())
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute(
            "INSERT INTO sessions (session, user, created_at) VALUES (?, ?, ?)",
            (session, user, created_at),
        )
        conn.commit()
        conn.close()
        return session

    def delete(self, session) -> None:
        """Delete session.

        Args:
            session (str): The session."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("DELETE FROM sessions WHERE session=?", (session,))
        conn.commit()
        conn.close()

    def get_user(self, session) -> str:
        """Get user by session.

        Args:
            session (str): The session.

        Returns:
            str: The user."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT user FROM sessions WHERE session=?", (session,))
        user = c.fetchone()
        conn.close()
        if user:
            return user[0]
        return None

    def delete_user_sessions(self, user) -> None:
        """Delete all sessions of a user.

        Args:
            user (str): The user."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("DELETE FROM sessions WHERE user=?", (user,))
        conn.commit()
        conn.close()

    def purge_expired(self, days) -> None:
        """Purge expired sessions.

        Args:
            days (int): The days."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute(
            "DELETE FROM sessions WHERE created_at < ?",
            (int(time.time()) - days * 24 * 60 * 60,),
        )
        conn.commit()
        conn.close()
