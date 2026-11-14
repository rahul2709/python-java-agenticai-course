# Northstar registration service

This Java 21 Spring Boot application serves the Northstar pages, accepts
registrations and password reset requests, and stores them in a file-backed H2
database.

## Run

Java 21 is required. Run the service from this folder in PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

In a second PowerShell window, start the local web server:

```powershell
node javascript/preview-server.js
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) for the Northstar pages.
The preview server proxies registration and password-reset requests to the
Java service on port 8080. Open
[http://127.0.0.1:8000/dashboard](http://127.0.0.1:8000/dashboard) for the
project file dashboard; it scans workspace file metadata locally.

The database files are created in `data/` and persist between service restarts.
Keep this directory private because it contains personal registration details.

## API

`POST /api/registrations` accepts a JSON object with required `firstName`,
`lastName`, `address`, `email`, and `phone` fields. It returns `201 Created`
with the saved registration, `409 Conflict` for a duplicate email, or
`400 Bad Request` for invalid input.

`POST /api/password-reset-requests` accepts an email address and records the
request in the `password_reset_requests` table. It returns a generic `202
Accepted` response. This demo does not send reset email or change passwords.

## Docker

Docker Desktop is required and must be running. Build the image from this
folder:

```powershell
docker build -t northstar-registration:local .
```

Run the app with a named volume so the H2 database survives container
recreation:

```powershell
docker run --name northstar-registration -p 127.0.0.1:18080:8080 -v northstar-data:/app/data northstar-registration:local
```

Then open [http://127.0.0.1:18080](http://127.0.0.1:18080) for the web app
or [http://127.0.0.1:18080/dashboard](http://127.0.0.1:18080/dashboard) for
the packaged project dashboard. The Docker build generates a read-only
inventory snapshot for the project dashboard.

This starter service does not provide sign-in authentication or account
management. Add authentication, access controls, and an appropriate database
backup and encryption strategy before using it with real user information.

## Project folders

The Northstar HTML pages are in `html/`, browser and preview JavaScript is in
`javascript/`, and Python scripts and the contact-management project are in
`python/`.
