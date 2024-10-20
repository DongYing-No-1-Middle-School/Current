# Current

Current - An intelligent platform for scholar newspaper.

## Project Structure

- `/orion` - The backend common libs (user, sessions...).
- `/routes` - The page and API routes.
- `/static` - "/static" files
- `/templates` - The templates for the pages.

## How to Run

1. Install the dependencies: `pip install -r requirements.txt`
2. Run the server: `python app.py` (from sources) / `python app.pyc` (from compiled)
3. Open the browser and go to `http://localhost:3000/`
4. Follow the instructions on the page.
5. Enjoy!

### Note: Use gunicon to run the server in production

Use `gunicorn app:app` instead of `python ...` to run the server in production.

## Development

1. Install backend dependencies: `pip install -r requirements.txt`
2. Install frontend dependencies: `npm install`
3. Use two windows to run the backend and TailwindCSS watcher:

```bash
# Window 1
flask run --debug
# Window 2
bash ./tailwind.sh
```

4. Open the browser and go to `http://localhost:3000/`
5. Enjoy!

### Note: Compile the project

Use `bash ./compile.sh` to compile the project.

See Github Actions for automatic compilation.

## About **Sentry**

[Sentry](https://sentry.io/) is a service that helps you monitor and fix crashes in real time.

The SDK is included in the project, but you need to set parameters in the `config.json` manually to enable it.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Made by Dongying No.1 Middle School students.
