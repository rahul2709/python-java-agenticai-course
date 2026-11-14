const categoryGrid = document.querySelector("#category-grid");
const fileGrid = document.querySelector("#file-grid");
const fileSearch = document.querySelector("#file-search");
const projectSummary = document.querySelector("#project-summary");
const scanInfo = document.querySelector("#scan-info");
const totalFiles = document.querySelector("#total-files");
const totalCategories = document.querySelector("#total-categories");

let inventory = [];
let selectedCategory = "";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderCategories(categories) {
  categoryGrid.replaceChildren();

  const allCategory = { name: "All files", count: inventory.length };
  [allCategory, ...categories].forEach(({ name, count }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.setAttribute("aria-pressed", String(selectedCategory === name ||
      (!selectedCategory && name === "All files")));

    const label = document.createElement("span");
    label.className = "category-name";
    label.textContent = name;

    const total = document.createElement("span");
    total.className = "category-count";
    total.textContent = `${count} ${count === 1 ? "file" : "files"}`;

    button.append(label, total);
    button.addEventListener("click", () => {
      selectedCategory = name === "All files" ? "" : name;
      renderCategories(categories);
      renderFiles();
    });
    categoryGrid.append(button);
  });
}

function renderFiles() {
  const query = fileSearch.value.trim().toLowerCase();
  const visibleFiles = inventory.filter((file) => {
    const matchesCategory = !selectedCategory || file.category === selectedCategory;
    const matchesQuery = !query ||
      `${file.path} ${file.category} ${file.summary}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  fileGrid.replaceChildren();
  if (visibleFiles.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "state-message";
    emptyState.textContent = "No files match the selected category or search.";
    fileGrid.append(emptyState);
    return;
  }

  visibleFiles.forEach((file) => {
    const card = document.createElement("article");
    card.className = "file-card";

    const top = document.createElement("div");
    top.className = "file-card-top";

    const type = document.createElement("span");
    type.className = "file-type";
    type.textContent = file.category;

    const size = document.createElement("span");
    size.className = "file-size";
    size.textContent = formatBytes(file.sizeBytes);

    const name = document.createElement("span");
    name.className = "file-path";
    name.textContent = file.path;

    const summary = document.createElement("p");
    summary.className = "file-summary";
    summary.textContent = file.summary;

    top.append(type, size);
    card.append(top, name, summary);
    fileGrid.append(card);
  });
}

async function loadInventory() {
  try {
    const response = await fetch("/project-inventory.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Inventory request failed with status ${response.status}`);
    }

    const result = await response.json();
    inventory = result.files;
    projectSummary.textContent = result.project.summary;
    totalFiles.textContent = result.totalFiles.toLocaleString();
    totalCategories.textContent = result.categories.length.toLocaleString();
    scanInfo.textContent = `Scanned ${new Date(result.generatedAt).toLocaleString()}`;
    renderCategories(result.categories);
    renderFiles();
  } catch (error) {
    console.error("Could not load project dashboard:", error);
    scanInfo.textContent = "Workspace scan failed";
    const message = document.createElement("p");
    message.className = "state-message error";
    message.textContent = "The project inventory could not be loaded. Restart the local preview server and try again.";
    categoryGrid.replaceChildren(message.cloneNode(true));
    fileGrid.replaceChildren(message);
  }
}

fileSearch.addEventListener("input", renderFiles);
loadInventory();
