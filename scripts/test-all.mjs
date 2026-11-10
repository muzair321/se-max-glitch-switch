import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const checks = [
  ["Backend unit tests", ["--prefix", "backend", "test"]],
  ["Backend type-check", ["--prefix", "backend", "run", "typecheck"]],
  ["Frontend lint", ["--prefix", "frontend/my-react-app", "run", "lint"]],
  ["Frontend production build", ["--prefix", "frontend/my-react-app", "run", "build"]],
];

for (const [label, args] of checks) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(npm, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    console.error(`Unable to run ${label}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status ?? 1}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll automated checks passed.");
