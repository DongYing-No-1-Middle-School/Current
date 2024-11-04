"""Provide features for user management"""

import hashlib
import sqlite3


class Users:
    """Provide basic user operations.

    Args:
        oriondb (str): The database name.
        extras (list): Extra fields for the user table."""

    oriondb = "orion.db"

    def __init__(self, oriondb="orion.db", extras=None) -> None:
        self.oriondb = oriondb
        if extras is None:
            extras = ["email"]
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, passwd TEXT, "
        for extra in extras:
            query += extra + " TEXT, "
        query = query[:-2] + ")"
        c.execute(query)
        conn.commit()
        conn.close()

    def get_by_name(self, username) -> dict:
        """Get user by name.

        Args:
            username (str): The user name.

        Returns:
            dict: The user data."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE name=?", (username,))
        user = c.fetchone()
        conn.close()
        if user:
            col_names = [desc[0] for desc in c.description]
            res = {col_names[i]: user[i] for i in range(len(user))}
            del res["passwd"]
            return res
        else:
            return None

    def get_by_id(self, userid) -> dict:
        """Get user by id.

        Args:
            userid (int): The user id.

        Returns:
            dict: The user data."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id=?", (userid,))
        user = c.fetchone()
        conn.close()
        if user:
            col_names = [desc[0] for desc in c.description]
            res = {col_names[i]: user[i] for i in range(len(user))}
            del res["passwd"]
            return user
        else:
            return None

    def verify(self, username, passwd) -> bool:
        """Verify user.

        Args:
            username (str): The user name.
            passwd (str): The user password.

        Returns:
            bool: True if the user is verified."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE name=?", (username,))
        user = c.fetchone()
        conn.close()
        if not user:
            return False
        elif user[2] != hashlib.sha256(passwd.encode()).hexdigest():
            return False
        else:
            return True

    def create(self, username, passwd, **kwargs) -> None:
        """Create user.

        Args:
            username (str): The user name.
            passwd (str): The user password.
            **kwargs: Extra fields."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "INSERT INTO users (name, passwd, "
        for key in kwargs:
            query += key + ", "
        query = query[:-2] + ") VALUES (?, ?, "
        for key in kwargs:
            query += "?, "
        query = query[:-2] + ")"
        c.execute(
            query,
            (username, hashlib.sha256(passwd.encode()).hexdigest(), *kwargs.values()),
        )
        conn.commit()
        conn.close()

    def delete(self, username) -> None:
        """Delete user.

        Args:
            username (str): The username."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("DELETE FROM users WHERE name=?", (username,))
        conn.commit()
        conn.close()

    def update(self, username, **kwargs) -> None:
        """Update user.

        Args:
            username (str): The username.
            **kwargs: Extra fields."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "UPDATE users SET "
        for key in kwargs:
            if key == "passwd":
                kwargs[key] = hashlib.sha256(kwargs[key].encode()).hexdigest()
            query += key + "=?, "
        query = query[:-2] + " WHERE name=?"
        c.execute(query, (*kwargs.values(), username))
        conn.commit()
        conn.close()

    def listall(self) -> list:
        """List users.

        Returns:
            list: The list of users."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM users")
        users = c.fetchall()
        conn.close()
        col_names = [desc[0] for desc in c.description]
        res = []
        for user in users:
            res.append({col_names[i]: user[i] for i in range(len(user))})
            del res[-1]["passwd"]
        return res
