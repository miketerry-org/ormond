// runner.js: runs all tests in a test script file

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

// ✅ Helper: Ensure callbacks are declared async
function assertAsyncCallback(name, callback) {
  if (callback.constructor.name !== "AsyncFunction") {
    throw new Error(`Callback passed to ${name} must be declared with 'async'`);
  }
}

// Reset state between test files
function resetGlobals() {
  currentSuite = null;
  globalState.suites = [];
}

// ✅ Global test functions

global.describe = (description, callback) => {
  assertAsyncCallback(`describe("${description}")`, callback);

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

  callback()
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
};

global.it = (description, callback) => {
  if (!currentSuite) {
    throw new Error(`'it' must be called within a 'describe' block`);
  }
  assertAsyncCallback(`it("${description}")`, callback);
  currentSuite.tests.push({ description, callback });
};

global.beforeAll = callback => {
  if (!currentSuite) {
    throw new Error(`'beforeAll' must be called within a 'describe' block`);
  }
  assertAsyncCallback("beforeAll", callback);
  currentSuite.beforeAll.push(callback);
};

global.afterAll = callback => {
  if (!currentSuite) {
    throw new Error(`'afterAll' must be called within a 'describe' block`);
  }
  assertAsyncCallback("afterAll", callback);
  currentSuite.afterAll.push(callback);
};

global.beforeEach = callback => {
  if (!currentSuite) {
    throw new Error(`'beforeEach' must be called within a 'describe' block`);
  }
  assertAsyncCallback("beforeEach", callback);
  currentSuite.beforeEach.push(callback);
};

global.afterEach = callback => {
  if (!currentSuite) {
    throw new Error(`'afterEach' must be called within a 'describe' block`);
  }
  assertAsyncCallback("afterEach", callback);
  currentSuite.afterEach.push(callback);
};

// ✅ Run a single test lifecycle hook
async function runHook(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`❌ Error in ${name}:`, err);
  }
}

// ✅ Run all test suites in a file
async function runTestSuites(testFilePath, stats) {
  resetGlobals();

  const fileUrl = pathToFileURL(testFilePath).href;

  // 🚨 Bust the import cache to allow re-running tests on changes
  await import(`${fileUrl}?update=${Date.now()}`);

  // Wait for async describe callbacks to complete
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

// ✅ Run all test files
export async function runAllTestsInFiles(filePaths, stats) {
  for (const file of filePaths) {
    console.log(`\nRunning tests in: ${file}`);
    await runTestSuites(file, stats);
    stats.files.push(file);
  }
}
