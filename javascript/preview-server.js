const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const pages = new Map([
  ["/", "../html/index.html"],
  ["/index.html", "../html/index.html"],
  ["/dashboard", "../html/dashboard.html"],
  ["/dashboard.html", "../html/dashboard.html"],
  ["/javascript/dashboard.js", "dashboard.js"],
  ["/forgot-password.html", "../html/forgot-password.html"],
  ["/javascript/forgot-password.js", "forgot-password.js"],
  ["/registration.html", "../html/registration.html"],
  ["/javascript/registration.js", "registration.js"]
]);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

const projectRoot = path.resolve(__dirname, "..");

function describeFile(filePath, category) {
  const name = path.posix.basename(filePath);
  const descriptions = {
    "Dockerfile": "Defines the multi-stage container build for the Spring Boot application and its web pages.",
    ".dockerignore": "Controls which files are excluded from the Docker build context.",
    "pom.xml": "Declares the Maven project, Java version, Spring Boot dependencies, and build plugins.",
    "README.md": "Documents the project, local run instructions, API endpoints, Docker workflow, and folder layout.",
    "preview-server.js": "Serves the local pages and proxies browser API requests to the Spring Boot service.",
    "index.html": "Provides the Northstar sign-in screen and navigation to registration and password recovery.",
    "registration.html": "Presents the account registration form and links back to sign-in.",
    "forgot-password.html": "Collects an email address for a password reset request.",
    "dashboard.html": "Displays a searchable overview of project files, categories, and technology.",
    "registration.js": "Validates registration input and submits new accounts to the registration API.",
    "forgot-password.js": "Validates an email address and submits a password reset request to the API.",
    "code.py": "Contains the standalone Python arithmetic example.",
    "sum.py": "Contains the interactive Python name and age example.",
    "index.py": "Implements the Tkinter contact-management application and its SQLite operations.",
    "RegistrationServiceApplication.java": "Bootstraps the Spring Boot registration service.",
    "RegistrationController.java": "Validates and creates registration records through the REST API.",
    "RegistrationRequest.java": "Defines validated input fields accepted by the registration endpoint.",
    "RegistrationResponse.java": "Defines the registration data returned by the REST API.",
    "RegistrationRepository.java": "Provides Spring Data access to registration records.",
    "Registration.java": "Maps account registration details to the H2 database.",
    "PasswordResetRequestController.java": "Accepts reset requests and saves normalized email addresses.",
    "PasswordResetRequestPayload.java": "Defines and validates password reset request input.",
    "PasswordResetRequestResponse.java": "Defines the generic response returned for reset requests.",
    "PasswordResetRequestRepository.java": "Provides Spring Data access to persisted reset requests.",
    "PasswordResetRequest.java": "Stores a password reset request and its creation time in H2.",
    "RegistrationExceptionHandler.java": "Converts validation and duplicate-record errors into API responses.",
    "ApiError.java": "Defines a consistent API error message and optional field errors.",
    "RegistrationControllerTests.java": "Exercises registration and password-reset API behavior with Spring MockMvc.",
    "application.properties": "Configures the Spring server and file-backed H2 database connection.",
    "RegistrationServiceApplication.class": "Compiled application entry point produced by the Maven build.",
    "RegistrationControllerTests.class": "Compiled registration API test class produced by the Maven build.",
    "northstar.mv.db": "File-backed H2 database containing application records.",
    "pythontut.db": "SQLite database file associated with the contact-management project."
  };

  if (descriptions[name]) {
    return descriptions[name];
  }
  if (category === "Tests") {
    return "Automated test source or report used to verify application behavior.";
  }
  if (category === "Build artifacts") {
    return "Generated Maven build output; recreated when the project is built.";
  }
  if (category === "Configuration & build") {
    return "Project or tool configuration that supports building and running the application.";
  }
  if (category === "Documentation") {
    return "Project documentation or supporting reference material.";
  }
  if (category === "Data & databases") {
    return "Local project data or database file. The dashboard lists its metadata only.";
  }
  if (category === "Python") {
    return "Python source file in the course or contact-management project.";
  }
  if (category === "HTML pages") {
    return "HTML page used by the local Northstar web experience.";
  }
  if (category === "JavaScript") {
    return "JavaScript source used by the browser experience or local preview server.";
  }
  if (category === "Backend (Java)") {
    return "Java source in the Spring Boot application.";
  }
  return "Supporting project file.";
}

function categorizeFile(filePath) {
  const normalizedPath = filePath.toLowerCase();
  const extension = path.posix.extname(normalizedPath);

  if (normalizedPath.startsWith("src/test/") || normalizedPath.includes("/test-classes/") ||
      normalizedPath.includes("/surefire-reports/")) {
    return "Tests";
  }
  if (normalizedPath.startsWith("target/") || extension === ".class" || extension === ".lst") {
    return "Build artifacts";
  }
  if ([".java"].includes(extension)) return "Backend (Java)";
  if ([".html", ".htm"].includes(extension)) return "HTML pages";
  if ([".js", ".mjs", ".cjs"].includes(extension)) return "JavaScript";
  if (extension === ".py") return "Python";
  if ([".db", ".mv.db", ".sqlite", ".sqlite3"].includes(extension) ||
      normalizedPath.endsWith(".mv.db")) {
    return "Data & databases";
  }
  if ([".md", ".txt"].includes(extension)) return "Documentation";
  if ([".xml", ".properties", ".json", ".yml", ".yaml", ".cmd", ".ps1", ".sh"].includes(extension) ||
      [".gitignore", ".dockerignore", ".gitattributes"].includes(path.posix.basename(normalizedPath)) ||
      path.posix.basename(normalizedPath).toLowerCase().startsWith("dockerfile") ||
      normalizedPath.startsWith(".mvn/") || normalizedPath.startsWith(".vscode/") ||
      ["mvnw", "mvnw.cmd"].includes(path.posix.basename(normalizedPath))) {
    return "Configuration & build";
  }
  return "Other";
}

async function readFileInventory() {
  const files = [];

  async function visit(directory) {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(projectRoot, absolutePath).split(path.sep).join("/");
        const stats = await fs.promises.stat(absolutePath);
        const category = categorizeFile(relativePath);
        files.push({
          path: relativePath,
          name: entry.name,
          category,
          sizeBytes: stats.size,
          summary: describeFile(relativePath, category)
        });
      }
    }
  }

  await visit(projectRoot);
  files.sort((first, second) => first.path.localeCompare(second.path));
  const counts = new Map();
  for (const file of files) {
    counts.set(file.category, (counts.get(file.category) || 0) + 1);
  }

  return {
    project: {
      name: "Northstar Registration Service",
      summary: "A Java 21 Spring Boot service with a browser-based registration experience, file-backed H2 persistence, Docker packaging, and a separate Python learning/contact-management project."
    },
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    categories: [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => first.name.localeCompare(second.name)),
    files
  };
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const pathname = url.pathname;

  if (pathname === "/api/file-inventory" || pathname === "/project-inventory.json") {
    if (request.method !== "GET") {
      response.writeHead(405, { Allow: "GET" });
      response.end();
      return;
    }

    readFileInventory()
      .then((inventory) => {
        response.writeHead(200, {
          "Content-Type": contentTypes.get(".json"),
          "Cache-Control": "no-store"
        });
        response.end(JSON.stringify(inventory));
      })
      .catch((error) => {
        console.error("Could not read project file inventory:", error);
        response.writeHead(500, { "Content-Type": contentTypes.get(".json") });
        response.end(JSON.stringify({ message: "Could not read the project file inventory." }));
      });
    return;
  }

  if (pathname.startsWith("/api/")) {
    const proxy = http.request({
      hostname: "127.0.0.1",
      port: 8080,
      path: `${pathname}${url.search}`,
      method: request.method,
      headers: { ...request.headers, host: "127.0.0.1:8080" }
    }, (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });

    proxy.on("error", (error) => {
      console.error("API proxy failed:", error);
      if (!response.headersSent) {
        response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      }
      response.end(JSON.stringify({
        message: "Could not reach the Java backend. Make sure it is running on port 8080."
      }));
    });

    request.pipe(proxy);
    return;
  }

  const fileName = pathname === "/dashboard" ? "../html/dashboard.html" : pages.get(pathname);

  if (!fileName) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes.get(path.extname(fileName))
  });
  fs.createReadStream(path.resolve(__dirname, fileName))
    .on("error", () => {
      response.writeHead(500);
      response.end("Could not load page");
    })
    .pipe(response);
});

if (require.main === module) {
  server.listen(8000, "127.0.0.1", () => {
    console.log("Northstar pages available at http://127.0.0.1:8000");
  });
}

module.exports = { readFileInventory };
