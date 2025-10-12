// scan.js

"use strict";

import fs from "fs";
import path from "path";

/**
 * Check if a file name matches the configured `endsWith` extensions.
 * If `endsWith` is empty or not defined, always returns true.
 *
 * @param {string} filename - The name of the file (not the full path).
 * @param {object} options - Options object.
 * @param {string[]} [options.endsWith] - List of file suffixes to match.
 * @returns {boolean} - True if the filename matches any of the suffixes.
 */
function fileEndsWith(filename, options) {
  if (!options.endsWith || options.endsWith.length === 0) {
    return true;
  }
  return options.endsWith.some(ext => filename.endsWith(ext));
}

/**
 * Recursively scans a directory for matching files based on provided options.
 *
 * @param {string} dirpath - The directory path to scan.
 * @param {object} options - Scan options.
 * @param {string[]} [options.endsWith] - File suffixes to include.
 * @param {string[]} [options.excludeDirs] - Directory names to exclude.
 * @param {string[]} [options.onlyFiles] - List of exact filenames to include (no path).
 * @param {string[]} resultFiles - Accumulator for matching file paths.
 */
function scanDir(dirpath, options, resultFiles) {
  const entries = fs.readdirSync(dirpath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.resolve(dirpath, entry.name);

    if (entry.isDirectory()) {
      if (
        Array.isArray(options.excludeDirs) &&
        options.excludeDirs.includes(entry.name)
      ) {
        continue;
      }
      scanDir(fullPath, options, resultFiles);
    } else if (entry.isFile()) {
      const filename = entry.name;

      const isInOnlyFiles =
        !options.onlyFiles ||
        options.onlyFiles.length === 0 ||
        options.onlyFiles.includes(filename);

      const matchesSuffix = fileEndsWith(filename, options);

      if (isInOnlyFiles && matchesSuffix) {
        resultFiles.push(fullPath);
      }
    }
  }
}

/**
 * Recursively finds files in specified directories, filtered by suffix, name, and exclusions.
 *
 * @param {object} options - Scan configuration.
 * @param {string[]} [options.searchDirs=["."]] - Directories to search in (relative to CWD).
 * @param {string[]} [options.endsWith] - File suffixes to include (e.g. ".test.js").
 * @param {string[]} [options.excludeDirs] - Directory names to skip during traversal.
 * @param {string[]} [options.onlyFiles] - Exact file names (no path) to include.
 * @returns {string[]} - Array of absolute file paths that matched the criteria.
 */
export default function scanFiles(options = {}) {
  const searchDirs =
    Array.isArray(options.searchDirs) && options.searchDirs.length > 0
      ? options.searchDirs
      : [process.cwd()];

  const resultFiles = [];

  for (const dirname of searchDirs) {
    const dirpath = path.resolve(process.cwd(), dirname);
    if (fs.existsSync(dirpath) && fs.lstatSync(dirpath).isDirectory()) {
      scanDir(dirpath, options, resultFiles);
    }
  }

  return resultFiles;
}
