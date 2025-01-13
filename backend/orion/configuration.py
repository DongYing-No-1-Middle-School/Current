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
            "CREATE TABLE IF NOT EXISTS configuration (key TEXT PRIMARY KEY, value TEXT, type TEXT, defaultval TEXT)"
        )
        conn.commit()
        conn.close()

    def encode_data(self, data, valtype):
        """
        Encode data so it can be stored in the database.

        Args:
            data (str): The data to encode.
            valtype ("str"|"bool"|"int"|"dict"): The data type.
        """
        if valtype == "str":
            return data
        elif valtype == "bool":
            return "True" if data else "False"
        elif valtype == "int":
            return str(data)
        elif valtype == "dict":
            return str(data)
        else:
            raise ValueError(f"Invalid type '{valtype}'")
        
    def decode_data(self, data, valtype):
        """
        Decode data so it can be used in the application.

        Args:
            data (str): The data to decode.
            valtype ("str"|"bool"|"int"|"dict"): The data type.
        """
        if valtype == "str":
            return data
        elif valtype == "bool":
            return data == "True"
        elif valtype == "int":
            return int(data)
        elif valtype == "dict":
            return eval(data)
        else:
            raise ValueError(f"Invalid type '{valtype}'")

    def set_default(self, key, valtype, defaultval):
        """
        Set default value for a key.

        Args:
            key (str): The configuration key.
            valtype ("str"|"bool"|"int"|"dict"): The configuration type.
            defaultval (str): The configuration default value.
        """
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT type FROM configuration WHERE key=?", (key,))
        result = c.fetchone()
        if result is None:
            c.execute(
                "INSERT INTO configuration (key, value, type, defaultval) VALUES (?, ?, ?, ?)",
                (
                    key,
                    self.encode_data(defaultval, valtype),
                    valtype,
                    self.encode_data(defaultval, valtype),
                ),
            )
        elif result[0] != valtype:
            raise ValueError(
                f"Type mismatch for key '{key}': expected {result[0]}, got {valtype}"
            )
        else:
            c.execute(
                "UPDATE configuration SET defaultval=? WHERE key=?",
                (self.encode_data(defaultval, valtype), key),
            )
        conn.commit()
        conn.close()
        
    def get_raw(self, key):
        """
        Get configuration value.

        Args:
            key (str): The configuration key.

        Returns:
            str: The configuration value.
        """
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT value FROM configuration WHERE key=?", (key,))
        value = c.fetchone()
        conn.close()
        return value[0] if value else None
    
    def get(self, key):
        """
        Get configuration value.

        Args:
            key (str): The configuration key.

        Returns:
            str: The configuration value.
        """
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT value, type FROM configuration WHERE key=?", (key,))
        result = c.fetchone()
        conn.close()
        if result:
            value, valtype = result
            return self.decode_data(value, valtype)
        else:
            return None
    
    def update(self, key, value: any):
        """
        Update configuration value.

        Args:
            key (str): The configuration key.
            value (any): The configuration value.
        """
        conn = sqlite3.connect(self.oriondb)
        c = conn.cursor()
        c.execute("SELECT type FROM configuration WHERE key=?", (key,))
        result = c.fetchone()
        if result is None:
            raise ValueError(f"Key '{key}' not found, please set a default value first")
        valtype = result[0]
        c.execute("UPDATE configuration SET value=? WHERE key=?", (self.encode_data(value, valtype), key))
        conn.commit()
        conn.close()

    # def add(self, key, value):
    #     """Add configuration.

    #     Args:
    #         key (str): The configuration key.
    #         value (str): The configuration value."""
    #     conn = sqlite3.connect(self.oriondb)
    #     c = conn.cursor()
    #     c.execute("INSERT INTO configuration (key, value) VALUES (?, ?)", (key, value))
    #     conn.commit()
    #     conn.close()

    # def get(self, key, default=""):
    #     """Get configuration.

    #     Args:
    #         key (str): The configuration key.

    #     Returns:
    #         str: The configuration value."""
    #     conn = sqlite3.connect(self.oriondb)
    #     c = conn.cursor()
    #     c.execute("SELECT value FROM configuration WHERE key=?", (key,))
    #     value = c.fetchone()
    #     if value:
    #         conn.close()
    #         return value[0]
    #     else:
    #         c.execute(
    #             "INSERT INTO configuration (key, value) VALUES (?, ?)", (key, default)
    #         )
    #         conn.close()
    #         return default

    # def remove(self, key):
    #     """Remove configuration.

    #     Args:
    #         key (str): The configuration key."""
    #     conn = sqlite3.connect(self.oriondb)
    #     c = conn.cursor()
    #     c.execute("DELETE FROM configuration WHERE key=?", (key,))
    #     conn.commit()
    #     conn.close()

    # def update(self, key, value):
    #     """Update configuration.

    #     Args:
    #         key (str): The configuration key.
    #         value (str): The configuration value."""
    #     conn = sqlite3.connect(self.oriondb)
    #     c = conn.cursor()
    #     c.execute("SELECT value FROM configuration WHERE key=?", (key,))
    #     if c.fetchone():
    #         c.execute("UPDATE configuration SET value=? WHERE key=?", (value, key))
    #     else:
    #         c.execute(
    #             "INSERT INTO configuration (key, value) VALUES (?, ?)", (key, value)
    #         )
    #     conn.commit()
    #     conn.close()
