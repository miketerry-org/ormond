// scan.js:

"use strict";

import fs from "fs";
import path from "path";
import { minimatch } from "minimatch";

function scanDirectory(dirname, internalOptions) {
  internalOptions.dirlist.push(dirname);

  const items = fs.readdirSync(dirname, { withFileTypes: true });

  for (const item of items) {
    if (internalOptions.excludeList.includes(item.name)) {
      continue;
    }

    const fullPath = path.resolve(dirname, item.name);

    if (item.isDirectory()) {
      if (internalOptions.recursive) {
        scanDirectory(fullPath, internalOptions);
      }
    } else if (item.isFile()) {
      const matches = internalOptions.wildcards.some(pattern =>
        minimatch(item.name, pattern)
      );
      if (matches) {
        internalOptions.filelist.push(fullPath);
      }
    }
  }
}

/**
 * Finds files matching patterns with include/exclude filters.
 *
 * @param {string} [watchDir="."] – Root directory to scan from.
 * @param {Object} [options={}]
 * @param {string[]} [options.includeDirMask=[]] – Directories to include.
 * @param {string[]} [options.excludeList=[]] – Directory names to exclude.
 * @param {boolean} [options.recursive=true] – Whether to recurse subdirs.
 * @param {string|string[]} [options.wildcards=["*"]] – File glob patterns.
 * @returns {{ files: string[], dirs: string[] }}
 */
function findFiles(watchDir = ".", options = {}) {
  const wildcards = Array.isArray(options.wildcards)
    ? options.wildcards
    : [options.wildcards || "*"];

  const internalOptions = {
    filelist: [],
    dirlist: [],
    excludeList: options.excludeList || [],
    recursive: options.recursive !== false,
    wildcards,
  };

  if (options.includeDirMask && options.includeDirMask.length > 0) {
    for (const relDir of options.includeDirMask) {
      const targetDir = path.resolve(watchDir, relDir);
      if (fs.existsSync(targetDir) && fs.lstatSync(targetDir).isDirectory()) {
        scanDirectory(targetDir, internalOptions);
      }
    }
  } else {
    scanDirectory(watchDir, internalOptions);
  }

  return {
    files: internalOptions.filelist,
    dirs: internalOptions.dirlist,
  };
}

export { findFiles, scanDirectory };
