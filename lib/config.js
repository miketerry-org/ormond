// config.js:

"use strict";

import fs from "fs";
import path from "path";

const configFilename = path.resolve(process.cwd(), "test.json");

function getDefaultConfig() {
  return {
    watchDir: ".",
    includeDirMask: ["test"],
    includeFileMask: ["*.test.js", "*.test.ts", "*.test.mjs"],
    excludeDirMask: [],
    excludeFileMask: [],
  };
}

function saveDefaultConfig() {
  try {
    fs.writeFileSync(
      configFilename,
      JSON.stringify(getDefaultConfig(), null, 2),
      "utf-8"
    );
    console.log(`Created default config file at ${configFilename}`);
  } catch (err) {
    console.error(`Failed to write config file. (${configFilename})`, err);
  }
}

function msg_readConfigError(err) {
  return `Unable to read UnitTest-it config file, using default values. (${err.message})`;
}

const config = (function () {
  if (!fs.existsSync(configFilename)) {
    saveDefaultConfig();
  }

  try {
    const raw = fs.readFileSync(configFilename, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(msg_readConfigError(err));
    return getDefaultConfig();
  }
})();

export { config, saveDefaultConfig };
