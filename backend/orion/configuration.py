"""An easy way to storage and retrieve configuration data."""

import sqlite3


class Configuration:
    """Configuration class."""

    def __init__(self, oriondb):
        """Constructor.

        Args:
            oriondb (str): The Orion database."""
        self.oriondb = oriondb
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute(
            "CREATE TABLE IF NOT EXISTS configuration (key TEXT PRIMARY KEY, value TEXT)"
        )
        conn.commit()
        conn.close()

    def add(self, key, value):
        """Add configuration.

        Args:
            key (str): The configuration key.
            value (str): The configuration value."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("INSERT INTO configuration (key, value) VALUES (?, ?)", (key, value))
        conn.commit()
        conn.close()

    def get(self, key, default=''):
        """Get configuration.

        Args:
            key (str): The configuration key.

        Returns:
            str: The configuration value."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT value FROM configuration WHERE key=?", (key,))
        value = c.fetchone()
        if value:
            conn.close()
            return value[0]
        else:
            c.execute("INSERT INTO configuration (key, value) VALUES (?, ?)", (key, default))
            conn.close()
            return default

    def remove(self, key):
        """Remove configuration.

        Args:
            key (str): The configuration key."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("DELETE FROM configuration WHERE key=?", (key,))
        conn.commit()
        conn.close()

    def update(self, key, value):
        """Update configuration.

        Args:
            key (str): The configuration key.
            value (str): The configuration value."""
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT value FROM configuration WHERE key=?", (key,))
        if c.fetchone():
            c.execute("UPDATE configuration SET value=? WHERE key=?", (value, key))
        else:
            c.execute("INSERT INTO configuration (key, value) VALUES (?, ?)", (key, value))
        conn.commit()
        conn.close()
