// runner.js:

"use strict";

import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import expect from "./expect.js"; // ✅ Import expect

let currentSuite = null;

const globalState = {
  suites: [],
};

// ✅ Make expect globally available in all test files
global.expect = expect;

// Reset state between test files
function resetGlobals() {
  currentSuite = null;
  globalState.suites = [];
}

// Define global test functions
global.describe = (description, callback) => {
  const suite = {
    description,
    tests: [],
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
  };

  const prevSuite = currentSuite;
  currentSuite = suite;

  try {
    const maybePromise = callback();
    if (maybePromise instanceof Promise) {
      maybePromise
        .then(() => {
          globalState.suites.push(suite);
          currentSuite = prevSuite;
        })
        .catch(err => {
          console.error(
            `❌ Error in async describe("${description}") callback:`,
            err
          );
        });
    } else {
      globalState.suites.push(suite);
      currentSuite = prevSuite;
    }
  } catch (err) {
    console.error(`❌ Error in describe("${description}") callback:`, err);
  }
};

global.it = (description, callback) => {
  if (!currentSuite) {
    throw new Error(`'it' must be called within a 'describe' block`);
  }
  currentSuite.tests.push({ description, callback });
};

global.beforeAll = callback => {
  if (!currentSuite) {
    throw new Error(`'beforeAll' must be called within a 'describe' block`);
  }
  currentSuite.beforeAll.push(callback);
};

global.afterAll = callback => {
  if (!currentSuite) {
    throw new Error(`'afterAll' must be called within a 'describe' block`);
  }
  currentSuite.afterAll.push(callback);
};

global.beforeEach = callback => {
  if (!currentSuite) {
    throw new Error(`'beforeEach' must be called within a 'describe' block`);
  }
  currentSuite.beforeEach.push(callback);
};

global.afterEach = callback => {
  if (!currentSuite) {
    throw new Error(`'afterEach' must be called within a 'describe' block`);
  }
  currentSuite.afterEach.push(callback);
};

async function runHook(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`❌ Error in ${name}:`, err);
  }
}

// Run a single test file
async function runTestSuites(testFilePath, stats) {
  resetGlobals();

  const fileUrl = pathToFileURL(testFilePath).href;

  // Import the test file (loads global test definitions)
  await import(fileUrl);

  // Allow time for async describe blocks to finish
  await new Promise(resolve => setTimeout(resolve, 0));

  for (const suite of globalState.suites) {
    console.log(`\n📘 Suite: ${suite.description}`);

    for (const fn of suite.beforeAll) {
      await runHook("beforeAll", fn);
    }

    for (const test of suite.tests) {
      stats.total++;

      for (const fn of suite.beforeEach) {
        await runHook("beforeEach", fn);
      }

      try {
        await test.callback();
        console.log(`✅ ${test.description}`);
        stats.passed++;
      } catch (err) {
        console.error(`❌ ${test.description}`);
        console.error(err);
        stats.failed++;
      }

      for (const fn of suite.afterEach) {
        await runHook("afterEach", fn);
      }
    }

    for (const fn of suite.afterAll) {
      await runHook("afterAll", fn);
    }
  }
}

// Entry point to run all test files
export async function runAllTestsInFiles(filePaths, stats) {
  for (const file of filePaths) {
    console.log(`\nRunning tests in: ${file}`);
    await runTestSuites(file, stats);
    stats.files.push(file);
  }
}
