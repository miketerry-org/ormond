// logger.js

"use strict";

import fs from "fs";
import path from "path";

let logBuffer = [];
let startTime = new Date();

/**
 * Clears the in-memory log buffer and resets the timer.
 */
export function clearLog() {
  logBuffer = [];
  startTime = new Date();
}

/**
 * Appends a message to the log buffer and prints it to the console.
 * @param {string} msg - The message to log
 */
export function log(msg) {
  logBuffer.push(msg);
  console.log(msg);
}

/**
 * Finalizes and writes the current log buffer and summary stats
 * to a file under `./test-logs/YYYY-MM-DD/HH-MM-SS/summary.json`.
 *
 * @param {Object} summary - Summary object with test stats
 */
export function finalizeLog(summary = {}) {
  try {
    const dateStr = startTime.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = startTime.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

    const logDir = path.join("test-logs", dateStr, timeStr);
    fs.mkdirSync(logDir, { recursive: true });

    const logOutput = {
      timestamp: startTime.toISOString(),
      summary,
      logs: logBuffer,
    };

    const logPath = path.join(logDir, "summary.json");
    fs.writeFileSync(logPath, JSON.stringify(logOutput, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to write test log:", err);
  }
}
