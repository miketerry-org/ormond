// orchestrator.js

"use strict";

import { runAllTestsInFiles } from "./runner.js";
import scanFiles from "./scan.js";
import { config } from "./config.js";
import {
  log,
  startFileLog,
  finalizeFileLog,
  setTestRootDir,
} from "./logger.js";

/**
 * Main orchestration function:
 * - Scans for test files using config
 * - Runs all tests in matching files
 * - Tracks and logs stats
 * - Creates per-file JSON logs under ./test-logs/YYYY-MM-DD/HH_MM_SS/
 */
export async function orchestrate() {
  // Set the root test directory (used for relative log paths)
  setTestRootDir(config.searchDirs?.[0] || ".");

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
    startFileLog(file); // Begin per-file logging

    log(`\n▶ Running tests in: ${file}`);
    await runAllTestsInFiles([file], stats);

    stats.files.push(file);

    finalizeFileLog({
      file,
      total: stats.total,
      passed: stats.passed,
      failed: stats.failed,
      duration: ((Date.now() - stats.startTime) / 1000).toFixed(2),
    });
  }

  const durationSec = ((Date.now() - stats.startTime) / 1000).toFixed(2);

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
