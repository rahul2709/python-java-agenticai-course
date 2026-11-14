const fs = require("node:fs");
const path = require("node:path");
const { readFileInventory } = require("./preview-server");

async function main() {
  const outputPath = path.resolve(
    process.argv[2] || path.join(__dirname, "../src/main/resources/static/project-inventory.json")
  );
  const inventory = await readFileInventory();
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
  console.log(`Generated inventory for ${inventory.totalFiles} project files at ${outputPath}`);
}

main().catch((error) => {
  console.error("Could not generate project file inventory:", error);
  process.exitCode = 1;
});
