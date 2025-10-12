// lib/logger.js

"use strict";

import fs from "fs";
import path from "path";

const logFile = path.resolve(process.cwd(), "test.log");

/**
 * Logs a message to both the console and test.log file.
 * @param {string} message - The message to log.
 */
function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, `${message}\n`);
}

/**
 * Logs only to the log file (not to console).
 * @param {string} message - The message to log to file.
 */
function logFileOnly(message) {
  fs.appendFileSync(logFile, `${message}\n`);
}

/**
 * Clears the existing log file.
 */
function clearLog() {
  try {
    fs.writeFileSync(logFile, "");
  } catch (err) {
    console.error("Failed to clear test.log:", err);
  }
}

export { log, logFileOnly, clearLog };
