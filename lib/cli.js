// cli.js

"use strict";

import { findFiles } from "./scan.js";
import { runAllTestsInFiles } from "./runner.js";
import { config } from "./config.js";

function printHelp() {
  console.log(`
Usage: ormond [options]

Options:
  --help        Show this help message and exit
  --watch       Run tests and watch for file changes
`);
}

async function cli(args) {
  if (args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const filesResult = findFiles(config.watchDir, {
    includeDirMask: config.includeDirMask,
    excludeList: config.excludeDirMask,
    wildcards: config.includeFileMask,
    recursive: true,
  });

  if (filesResult.files.length === 0) {
    console.warn("⚠️  No test files found.");
    process.exit(0);
  }

  if (args.includes("--watch")) {
    console.log("Entering watch mode...\n");
    await runAllTestsInFiles(filesResult.files);

    const chokidar = await import("chokidar");

    const watcher = chokidar.watch(config.watchDir, {
      ignored: config.excludeDirMask.map(dir => `**/${dir}/**`),
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", async filePath => {
      console.log(`\nFile changed: ${filePath}`);
      const updatedFiles = findFiles(config.watchDir, {
        includeDirMask: config.includeDirMask,
        excludeList: config.excludeDirMask,
        wildcards: config.includeFileMask,
        recursive: true,
      }).files;

      if (updatedFiles.length === 0) {
        console.warn("⚠️  No test files found after change.");
      } else {
        await runAllTestsInFiles(updatedFiles);
      }
    });

    console.log("Watching for file changes...");
  } else {
    await runAllTestsInFiles(filesResult.files);
  }
}

export default cli;
