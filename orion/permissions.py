"""A simple permission system."""

import sqlite3
import re


class Permissions:
    """Provide basic permission operations.

    Args:
        oriondb (str): The database name."""

    oriondb = "orion.db"

    def __init__(self, oriondb="orion.db"):
        self.oriondb = oriondb
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        query = "CREATE TABLE IF NOT EXISTS permissions (target TEXT, node TEXT)"
        c.execute(query)
        conn.commit()
        conn.close()

    def valid_permission(self, permission) -> bool:
        """Check if permission is valid.

        Args:
            permission (str): The permission.

        Returns:
            bool: True if permission is valid."""
        pattern = r'^[a-zA-Z0-9*.]+$'
        return bool(re.match(pattern, permission))

    def grant(self, target, node):
        """Grant permission.

        Args:
            target (str): The target.
            node (str): The node."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute(
            "INSERT INTO permissions (target, node) VALUES (?, ?)", (target, node)
        )
        conn.commit()
        conn.close()

    def revoke(self, target, node):
        """Revoke permission.

        Args:
            target (str): The target.
            node (str): The node."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("DELETE FROM permissions WHERE target=? AND node=?", (target, node))
        conn.commit()
        conn.close()

    def has_permission(self, target, node):
        """Check if target has permission.

        Args:
            target (str): The target.
            node (str): The node.

        Returns:
            bool: True if target has permission."""
        nodechain = node.split(".")
        nodelist = ['*', node]
        for i in range(len(nodechain) - 1):
            nodelist.append(".".join(nodechain[:-i - 1] + ["*"]))
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT * FROM permissions WHERE target=?", (target,))
        permission = c.fetchall()
        conn.close()
        for p in permission:
            if p[1] in nodelist:
                return True
            if str(p[i]).startswith('group.'):
                if self.has_permission(p[i], node):
                    return True
        return False
