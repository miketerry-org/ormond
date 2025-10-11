// example_1.test.js:

import { describe, expect } from "../index.js";

describe("hello world", async () => {
  const value1 = 1;
  const value2 = 1;
  expect(value1).isType("number").isEQ(value2);
  console.log("goodbye world");
});
