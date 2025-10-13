// cli.js:

"use strict";

import chokidar from "chokidar";
import { config } from "./config.js";
import scanFiles from "./scan.js";
import { orchestrate } from "./orchestrator.js";

/**
 * Run tests safely
 */
async function runTests() {
  try {
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

    await orchestrate(testFiles);
  } catch (err) {
    console.error("❌ Test run failed:", err);
  }
}

/**
 * CLI entry point
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

  if (watchMode) {
    console.log("Watching for file changes...\n");

    let timeout = null;

    const watcher = chokidar.watch(config.watchDir, {
      persistent: true,
      ignoreInitial: true,
      ignored: /node_modules|test-logs/,
    });

    watcher.on("all", async (event, filePath) => {
      // Debounce rapid changes
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(async () => {
        console.clear();
        console.log(
          `🔁 File change detected (${event}: ${filePath}). Re-running tests...\n`
        );
        await runTests();
      }, 200);
    });

    // First run
    await runTests();

    // Graceful shutdown
    process.on("SIGINT", () => {
      watcher.close();
      console.log("\n👋 Watch mode stopped.");
      process.exit(0);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("🔴 Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", err => {
      console.error("🔴 Uncaught Exception:", err);
    });

    // Keep process alive
    process.stdin.resume();
  } else {
    await runTests();
  }
}
