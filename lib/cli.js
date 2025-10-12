// cli.js:

"use strict";

import fs from "fs";
import path from "path";
import { config } from "./config.js";
import scanFiles from "./scan.js";
import { orchestrate } from "./orchestrator.js";

/**
 * CLI entry point.
 * Parses arguments, discovers test files, runs orchestrator.
 */
export async function cli() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Usage: ormond [options]

Options:
  --help       Show this help message
  --watch      Watch for file changes and re-run tests
`);
    return;
  }

  const watchMode = args.includes("--watch");

  const testFiles = scanFiles({
    searchDirs: config.searchDirs,
    endsWith: config.endsWith,
    excludeDirs: config.excludeDirs,
    onlyFiles: config.onlyFiles,
  });

  if (testFiles.length === 0) {
    console.warn("⚠️  No test files found.");
    return;
  }

  // Run tests
  await orchestrate(testFiles);

  // Watch mode
  if (watchMode) {
    console.log("👀 Watching for file changes...");

    // Watch the first search dir (or cwd) recursively
    const watchTarget = config.searchDirs[0] || ".";

    const watcher = fs.watch(watchTarget, { recursive: true }, async () => {
      console.clear();
      console.log("🔁 Change detected. Re-running tests...\n");

      const updatedFiles = scanFiles({
        searchDirs: config.searchDirs,
        endsWith: config.endsWith,
        excludeDirs: config.excludeDirs,
        onlyFiles: config.onlyFiles,
      });

      if (updatedFiles.length === 0) {
        console.warn("⚠️  No test files found.");
        return;
      }

      await orchestrate(updatedFiles);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      watcher.close();
      console.log("\n👋 Watch mode stopped.");
      process.exit(0);
    });
  }
}
