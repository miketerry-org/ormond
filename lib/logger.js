// logger.js

"use strict";

import fs from "fs";
import path from "path";

let logBuffer = [];
let currentTestFile = null;
let testRootDir = "test"; // default, can be configured
let runTimestamp = new Date();

/**
 * Set the test root folder for relative path calculations
 * @param {string} rootDir - typically 'test' or your top-level test folder
 */
export function setTestRootDir(rootDir) {
  testRootDir = rootDir;
}

/**
 * Called before running tests in a new file
 * @param {string} testFilePath - absolute path of test file
 */
export function startFileLog(testFilePath) {
  currentTestFile = testFilePath;
  logBuffer = [];
  runTimestamp = new Date();
}

/**
 * Append a message to the log buffer and print it to console
 * @param {string} msg
 */
export function log(msg) {
  logBuffer.push(msg);
  console.log(msg);
}

/**
 * Finalize and write the log buffer to a JSON file
 * One JSON file per test file
 *
 * @param {Object} testSummary - stats for the test file: { total, passed, failed, durationMs }
 */
export function finalizeFileLog(testSummary = {}) {
  if (!currentTestFile) {
    console.error("❌ finalizeFileLog called without active test file.");
    return;
  }

  try {
    const dateStr = runTimestamp.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = runTimestamp
      .toTimeString()
      .split(" ")[0]
      .replace(/:/g, "_"); // HH_MM_SS

    const relativePath = path.relative(
      path.resolve(process.cwd(), testRootDir),
      currentTestFile
    );

    const outputFileName = path.basename(relativePath) + ".json";
    const subDir = path.dirname(relativePath);

    const outDir = path.join("test-logs", dateStr, timeStr, subDir);
    const outPath = path.join(outDir, outputFileName);

    fs.mkdirSync(outDir, { recursive: true });

    const output = {
      file: currentTestFile,
      relativePath,
      timestamp: runTimestamp.toISOString(),
      summary: testSummary,
      logs: logBuffer,
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to write log file:", err);
  } finally {
    currentTestFile = null;
    logBuffer = [];
  }
}
