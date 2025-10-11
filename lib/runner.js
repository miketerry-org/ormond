"use strict";

import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

// Class to represent a test suite
class Suite {
  constructor(description) {
    this.description = description;
    this.tests = [];
    this.beforeAll = [];
    this.afterAll = [];
    this.beforeEach = [];
    this.afterEach = [];
  }

  addTest(description, callback) {
    this.tests.push({ description, callback });
  }

  async run() {
    console.log(`\n📘 Suite: ${this.description}`);

    for (const hook of this.beforeAll) await runHook("beforeAll", hook);

    for (const test of this.tests) {
      for (const hook of this.beforeEach) await runHook("beforeEach", hook);

      try {
        await test.callback();
        console.log(`✅ ${test.description}`);
      } catch (err) {
        console.error(`❌ ${test.description}`);
        console.error(err);
      }

      for (const hook of this.afterEach) await runHook("afterEach", hook);
    }

    for (const hook of this.afterAll) await runHook("afterAll", hook);
  }
}

const state = {
  currentSuite: null,
  suites: [],
  pendingDescribe: [],
};

function resetState() {
  state.currentSuite = null;
  state.suites = [];
  state.pendingDescribe = [];
}

// Safe global function registration
function defineGlobal(name, fn) {
  Object.defineProperty(global, name, {
    value: fn,
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

function installGlobals() {
  defineGlobal("describe", (description, callback) => {
    const suite = new Suite(description);
    const previous = state.currentSuite;
    state.currentSuite = suite;

    const result = callback();
    const maybePromise = result && typeof result.then === "function";

    const done = () => {
      state.suites.push(suite);
      state.currentSuite = previous;
    };

    if (maybePromise) {
      const p = result.then(done).catch(err => {
        console.error(`❌ Error in async describe("${description}")`, err);
        state.currentSuite = previous;
      });
      state.pendingDescribe.push(p);
    } else {
      done();
    }
  });

  defineGlobal("it", (description, callback) => {
    if (!state.currentSuite) throw new Error(`'it' must be inside 'describe'`);
    state.currentSuite.addTest(description, callback);
  });

  defineGlobal("beforeAll", fn => {
    if (!state.currentSuite)
      throw new Error(`'beforeAll' must be inside 'describe'`);
    state.currentSuite.beforeAll.push(fn);
  });

  defineGlobal("afterAll", fn => {
    if (!state.currentSuite)
      throw new Error(`'afterAll' must be inside 'describe'`);
    state.currentSuite.afterAll.push(fn);
  });

  defineGlobal("beforeEach", fn => {
    if (!state.currentSuite)
      throw new Error(`'beforeEach' must be inside 'describe'`);
    state.currentSuite.beforeEach.push(fn);
  });

  defineGlobal("afterEach", fn => {
    if (!state.currentSuite)
      throw new Error(`'afterEach' must be inside 'describe'`);
    state.currentSuite.afterEach.push(fn);
  });
}

async function runHook(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`❌ Error in ${name}:`, err);
  }
}

// Runs a single test file
async function runTestFile(testFilePath) {
  resetState();
  installGlobals();

  if (!fs.existsSync(testFilePath)) {
    console.error(`❌ File not found: ${testFilePath}`);
    return;
  }

  const fileUrl = pathToFileURL(testFilePath).href;

  try {
    await import(fileUrl);
  } catch (err) {
    console.error(`❌ Failed to load test file: ${testFilePath}`);
    console.error(err);
    return;
  }

  // Wait for all async `describe()` callbacks to resolve
  await Promise.all(state.pendingDescribe);

  for (const suite of state.suites) {
    await suite.run();
  }
}

// Public API
export async function runAllTestsInFiles(filePaths) {
  for (const file of filePaths) {
    console.log(`\n🧪 Running tests in: ${file}`);
    await runTestFile(file);
  }
}
