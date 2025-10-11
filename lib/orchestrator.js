// orchestrator.js:

"use strict";

// load all necessary modules
import fs from "fs";
import path from "path";
import { config } from "./config.js";
import { findFiles } from "./scanner.js";
import { runAllTestsInFiles } from "./runner.js";

// Utility: matches name against an array of string patterns
function matchesAny(name, patterns) {
  return patterns.length === 0 || patterns.some(p => name.includes(p));
}

// Filter directory list using include/exclude masks
function filterDirectories(dirs, includeMasks, excludeMasks) {
  return dirs.filter(dir => {
    const included = matchesAny(dir, includeMasks);
    const excluded = matchesAny(dir, excludeMasks);
    return included && !excluded;
  });
}

// Filter file list using include/exclude masks
function filterFiles(files, includeMasks, excludeMasks) {
  return files.filter(file => {
    const included = matchesAny(file, includeMasks);
    const excluded = matchesAny(file, excludeMasks);
    return included && !excluded;
  });
}

// Main orchestrator function
export async function orchestrate(testFilesFromCLI = []) {
  let filesToRun = [];

  if (testFilesFromCLI.length > 0) {
    // Direct file paths passed via CLI (bypass discovery)
    filesToRun = testFilesFromCLI.filter(fs.existsSync);
  } else {
    const discovery = findFiles(config.startDir, {
      recursive: true,
      wildcards: config.includeFileMask,
      excludeList: [], // low-level scanner handles just names
    });

    const filteredDirs = filterDirectories(
      discovery.dirs,
      config.includeDirMask,
      config.excludeDirMask
    );
    const filteredFiles = filterFiles(
      discovery.files,
      config.includeFileMask,
      config.excludeFileMask
    );

    // Keep only files within filtered directories
    filesToRun = filteredFiles.filter(file =>
      filteredDirs.some(dir => file.startsWith(path.resolve(dir)))
    );
  }

  if (filesToRun.length === 0) {
    console.warn("⚠️  No test files found.");
    return;
  }

  console.log(`🧭 Discovered ${filesToRun.length} test file(s).`);
  await runAllTestsInFiles(filesToRun);
}
