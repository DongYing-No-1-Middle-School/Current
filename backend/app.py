"""Main file of Current app."""

# Import libs
import os
import json

from flask import Flask
from flask_apscheduler import APScheduler

import shutil

# Check if installed
if not os.path.exists("config.json"):
    print("Not installed.")
    inst = Flask(__name__)
    inst.app_context().push()
    from routes.install import install

    inst.register_blueprint(install)
    inst.run(host=os.getenv("FLASK_HOST", "0.0.0.0"), port=os.getenv("FLASK_PORT", 5000))
    exit(0)

# Load config from json file
with open("config.json", encoding="utf-8") as f:
    config = json.load(f)

# Initialize Flask app
app = Flask(__name__)
if config["flask"]["debug"]:
    app.debug = True
app.secret_key = os.urandom(24)

# Load .env fileimport os
def load_env(file_path):
    if not os.path.exists(file_path):
        example_file_path = f"{file_path}.example"
        if os.path.exists(example_file_path):
            shutil.copy(example_file_path, file_path)
            print(
                f"{file_path} not found. Copied {example_file_path} to {file_path}. Please configure it and restart the application."
            )
            exit(1)
        else:
            print(
                f"Neither {file_path} nor {example_file_path} found. Please create one of them and restart the application."
            )
            exit(1)
    with open(file_path, "r") as file:
        for line in file:
            # Remove leading/trailing whitespace
            line = line.strip()
            # Ignore empty lines and comments
            if not line or line.startswith("#"):
                continue
            # Split the line into key and value
            key, value = line.split("=", 1)
            # Remove any surrounding quotes from the value
            value = value.strip("'\"")
            # Set the environment variable
            os.environ[key] = value


load_env(".env")

# Initalize OrionDB
oriondb = "orion.db"
app.config["oriondb"] = oriondb

# Push context
app.app_context().push()

# Register routes
from routes.clients import clients

app.register_blueprint(clients)
from routes.issues import issues

app.register_blueprint(issues)
from routes.entries import entries

app.register_blueprint(entries)
from routes.management import management

app.register_blueprint(management)

# Register scheduler
import crontask

app.config.from_object(crontask.Config())
crontab = APScheduler()
crontab.init_app(app)
crontab.start()

if __name__ == "__main__":
    app.run(host=os.getenv("FLASK_HOST", "0.0.0.0"), port=os.getenv("FLASK_PORT", 5000))