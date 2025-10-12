// config.js:

"use strict";

import fs from "fs";
import path from "path";

const CONFIG_FILENAME = "test.json";

/**
 * Default configuration for test discovery.
 */
const DEFAULT_CONFIG = {
  searchDirs: ["test"], // Where to search
  endsWith: [".test.js", ".test.ts", ".test.mjs"], // File suffixes
  excludeDirs: ["node_modules", ".git"], // Directories to skip
  onlyFiles: [], // Optional: Exact filenames (no path)
};

/**
 * Loads the test configuration from disk, writing a default file if missing.
 *
 * @param {string} [filename=test.json] - The name of the config file to load.
 * @returns {object} The merged config object.
 */
function loadConfigFile(filename = CONFIG_FILENAME) {
  const configPath = path.resolve(process.cwd(), filename);

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  No config file found. Writing default to "${filename}".`);
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };
  } catch (err) {
    console.warn(
      `⚠️  Failed to load or parse config file "${filename}". Using defaults.`
    );
    return { ...DEFAULT_CONFIG };
  }
}

// Load immediately for global usage
const config = loadConfigFile();

export { config, loadConfigFile };
