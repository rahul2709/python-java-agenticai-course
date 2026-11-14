# Copilot instructions for Northstar Registration Service

## Build, test, and run

- Java 21 is required.
- Start the backend from the repo root in PowerShell:

  ```powershell
  .\mvnw.cmd spring-boot:run
  ```

  On bash or zsh, use:

  ```bash
  ./mvnw spring-boot:run
  ```

- In a second terminal, start the local preview server that serves the static HTML/JS pages:

  ```powershell
  node javascript/preview-server.js
  ```

  Then open `http://127.0.0.1:8000`.

- Run the Maven test suite:

  ```powershell
  .\mvnw.cmd test
  ```

- Run one focused test class:

  ```powershell
  .\mvnw.cmd -Dtest=RegistrationControllerTests test
  ```

- Run a single test method inside that class:

  ```powershell
  .\mvnw.cmd -Dtest=RegistrationControllerTests#createsRegistration test
  ```

- Build the application without running tests:

  ```powershell
  .\mvnw.cmd -DskipTests package
  ```

- Docker workflow from the repo root:

  ```powershell
  docker build -t northstar-registration:local .
  docker run --name northstar-registration -p 127.0.0.1:18080:8080 -v northstar-data:/app/data northstar-registration:local
  ```

- There is no dedicated lint task configured in this repo. Maven compile/test runs are the primary validation path.

## High-level architecture

- The application is a Java 21 Spring Boot service in `src/main/java/com/northstar/registration`.
- `RegistrationServiceApplication` boots the service. The HTTP API is split across controllers and repository interfaces, with validation and error formatting handled by `RegistrationExceptionHandler` and `ApiError`.
- The runtime database is H2 file-backed and configured in `src/main/resources/application.properties`:

  ```properties
  spring.datasource.url=jdbc:h2:file:./data/northstar;DB_CLOSE_ON_EXIT=FALSE
  ```

  This persists registration and reset-request data under `data/` between restarts.

- The front end is static HTML and JavaScript under `html/` and `javascript/`, not a server-rendered Spring MVC app. `javascript/preview-server.js` serves those pages locally and proxies browser requests to the Spring Boot API on port 8080.
- The dashboard route at `/dashboard` redirects to `/dashboard.html`; the dashboard reads local project metadata and is intentionally a demo viewer, not a database-backed admin panel.
- The `python/` folder contains a separate Python tutorial/contact-management project. It is not part of the Java service runtime unless a task explicitly targets it.

## Key conventions in this codebase

- Input validation is done with Jakarta validation on request payloads (`@Valid` and record annotations). Keep validation logic co-located with the controller or request type rather than validating only on the client.
- Email normalization is intentionally handled in controllers: values are trimmed and lowercased before duplicate checks and persistence (`trim().toLowerCase(Locale.ROOT)`). Preserving that normalization is important when changing the registration or password-reset flows.
- API errors are returned as a structured error payload through `RegistrationExceptionHandler`. When adding a validation error or new API failure, follow the existing `ApiError`/`fieldErrors` response pattern instead of inventing a new shape.
- CORS is explicitly configured for the local preview server (`http://127.0.0.1:8000` and `http://localhost:8000`). If the preview host or port changes, keep the controller origin list and front-end request URLs in sync.
- Tests are Spring MockMvc tests, not plain unit tests. The project keeps its API behavior covered in `src/test/java/com/northstar/registration/RegistrationControllerTests.java` and overrides the datasource to an in-memory H2 database for test isolation.
- The `data/` directory contains persisted personal details and should be treated as sensitive. Do not expose or log it casually.

## Existing repository instructions

- The repo-level README is the source of truth for run instructions and the API contract.
- The existing PR review agent in `.github/agents/pr-review.agent.md` is focused on pull request review quality and should not be treated as a general code change policy.
