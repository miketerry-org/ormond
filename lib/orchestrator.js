// orchestrater.js:

"use strict";

import { runAllTestsInFiles } from "./runner.js";
import scanFiles from "./scan.js";
import { config } from "./config.js";
import { log, clearLog } from "./logger.js";

/**
 * Main orchestration function:
 * - Scans for test files using config
 * - Runs all tests in matching files
 * - Tracks and logs stats
 */
export async function orchestrate() {
  clearLog();

  const testFiles = scanFiles({
    searchDirs: config.searchDirs,
    endsWith: config.endsWith,
    excludeDirs: config.excludeDirs,
    onlyFiles: config.onlyFiles, // optional
  });

  if (testFiles.length === 0) {
    log("⚠️  No test files found.");
    return;
  }

  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    files: [],
    startTime: Date.now(),
  };

  for (const file of testFiles) {
    log(`\n▶ Running tests in: ${file}`);
    await runAllTestsInFiles([file], stats);
    stats.files.push(file);
  }

  const durationSec = ((Date.now() - stats.startTime) / 1000).toFixed(2);

  // Format padded stats
  const labelPad = 14;
  const valuePad = 6;

  const line = (label, value) =>
    `${String(value).padStart(valuePad)} ${label.padEnd(labelPad)}`;

  log(""); // blank line
  log(line("Total Tests", stats.total));
  log(line("Passed Tests", stats.passed));
  log(line("Failed Tests", stats.failed));
  log(line("Duration (s)", durationSec));
}
