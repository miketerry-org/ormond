// expect.js (Jest‑style Matchers)

"use strict";

export default function expect(value) {
  const isFunction = typeof value === "function";

  const api = {
    toBe(other) {
      if (value !== other) {
        throw new Error(
          `Expected ${JSON.stringify(value)} to be ${JSON.stringify(other)}`
        );
      }
      return api;
    },

    toEqual(other) {
      const a = JSON.stringify(value);
      const b = JSON.stringify(other);
      if (a !== b) {
        throw new Error(`Expected ${a} to deeply equal ${b}`);
      }
      return api;
    },

    toBeLessThan(max) {
      if (!(value < max)) {
        throw new Error(`Expected ${value} to be less than ${max}`);
      }
      return api;
    },

    toBeLessThanOrEqual(max) {
      if (!(value <= max)) {
        throw new Error(`Expected ${value} to be less than or equal to ${max}`);
      }
      return api;
    },

    toBeGreaterThan(min) {
      if (!(value > min)) {
        throw new Error(`Expected ${value} to be greater than ${min}`);
      }
      return api;
    },

    toBeGreaterThanOrEqual(min) {
      if (!(value >= min)) {
        throw new Error(
          `Expected ${value} to be greater than or equal to ${min}`
        );
      }
      return api;
    },

    toMatch(regex) {
      if (typeof value !== "string") {
        throw new Error(`toMatch: expected a string, got ${typeof value}`);
      }
      if (!regex.test(value)) {
        throw new Error(`Expected '${value}' to match ${regex}`);
      }
      return api;
    },

    toContain(substr) {
      if (typeof value !== "string") {
        throw new Error(`toContain: expected a string, got ${typeof value}`);
      }
      if (!value.includes(substr)) {
        throw new Error(`Expected '${value}' to contain '${substr}'`);
      }
      return api;
    },

    toBeTypeOf(typeName) {
      if (typeof value !== typeName) {
        throw new Error(
          `Expected type '${typeName}', but got '${typeof value}'`
        );
      }
      return api;
    },

    toThrow(expected) {
      if (!isFunction) {
        throw new Error("toThrow matcher requires a function as the subject");
      }

      let threw = false;
      let error;
      try {
        value();
      } catch (err) {
        threw = true;
        error = err;
      }

      if (!threw) {
        throw new Error("Expected function to throw, but it did not");
      }

      if (expected instanceof RegExp) {
        if (!expected.test(error.message)) {
          throw new Error(
            `Expected error message to match ${expected}, but got "${error.message}"`
          );
        }
      } else if (typeof expected === "string") {
        if (!error.message.includes(expected)) {
          throw new Error(
            `Expected error message to contain "${expected}", but got "${error.message}"`
          );
        }
      } else if (expected !== undefined) {
        throw new Error(
          `toThrow only accepts string, RegExp, or no arguments — received ${typeof expected}`
        );
      }

      return api;
    },
  };

  const negated = {};
  for (const key in api) {
    if (typeof api[key] === "function") {
      negated[key] = (...args) => {
        try {
          api[key](...args);
        } catch {
          return negated; // original matcher threw → assertion passes
        }
        throw new Error(
          `Negated assertion failed: not.${key}(${args
            .map(a => JSON.stringify(a))
            .join(", ")})`
        );
      };
    }
  }

  negated.not = api;
  Object.defineProperty(api, "not", {
    value: negated,
    enumerable: false,
  });

  return api;
}
