// expect.js:

/**
 * A chainable assertion API.
 * @typedef {Object} ExpectAPI
 * @property {function(string): ExpectAPI} isType - asserts `typeof value === type`
 * @property {function(any): ExpectAPI} isEQ - asserts strict equality (`===`)
 * @property {function(any): ExpectAPI} isLE - asserts `<=`
 * @property {function(any): ExpectAPI} isLT - asserts `<`
 * @property {function(any): ExpectAPI} isGE - asserts `>=`
 * @property {function(any): ExpectAPI} isGT - asserts `>`
 * @property {function(any, any): ExpectAPI} isBetween - asserts value is between two given bounds (inclusive)
 * @property {function(RegExp): ExpectAPI} isMatch - asserts that value (string) matches regex
 * @property {function(string): ExpectAPI} isSubStr - asserts that substring appears in value (string)
 * @property {ExpectAPI} not - a “negation” version of the above methods
 */

/**
 * Create a chainable assertion object for a given value.
 *
 * @param {*} value - the value to assert against
 * @returns {ExpectAPI}
 * @throws {Error} if an assertion fails
 */
export default function expect(value) {
  const subject = value;

  const api = {
    /**
     * Assert that the typeof subject equals `typeName`.
     * @param {string} typeName
     * @returns {ExpectAPI}
     */
    isType(typeName) {
      const actual = typeof subject;
      if (actual !== typeName) {
        throw new Error(`Expected type '${typeName}', but got '${actual}'`);
      }
      return api;
    },

    /**
     * Assert strict equality (===).
     * @param {*} other
     * @returns {ExpectAPI}
     */
    isEQ(other) {
      if (subject !== other) {
        throw new Error(
          `Expected ${JSON.stringify(subject)} to be === ${JSON.stringify(
            other
          )}`
        );
      }
      return api;
    },

    /**
     * Assert subject <= max
     * @param {*} max
     * @returns {ExpectAPI}
     */
    isLE(max) {
      if (!(subject <= max)) {
        throw new Error(`Expected ${subject} to be <= ${max}`);
      }
      return api;
    },

    /**
     * Assert subject < max
     * @param {*} max
     * @returns {ExpectAPI}
     */
    isLT(max) {
      if (!(subject < max)) {
        throw new Error(`Expected ${subject} to be < ${max}`);
      }
      return api;
    },

    /**
     * Assert subject >= min
     * @param {*} min
     * @returns {ExpectAPI}
     */
    isGE(min) {
      if (!(subject >= min)) {
        throw new Error(`Expected ${subject} to be >= ${min}`);
      }
      return api;
    },

    /**
     * Assert subject > min
     * @param {*} min
     * @returns {ExpectAPI}
     */
    isGT(min) {
      if (!(subject > min)) {
        throw new Error(`Expected ${subject} to be > ${min}`);
      }
      return api;
    },

    /**
     * Assert subject is between low and high (inclusive).
     * @param {*} low
     * @param {*} high
     * @returns {ExpectAPI}
     */
    isBetween(low, high) {
      if (!(subject >= low && subject <= high)) {
        throw new Error(
          `Expected ${subject} to be between ${low} and ${high} (inclusive)`
        );
      }
      return api;
    },

    /**
     * Assert subject matches the given RegExp (when subject is string).
     * @param {RegExp} regex
     * @returns {ExpectAPI}
     */
    isMatch(regex) {
      if (typeof subject !== "string") {
        throw new Error(
          `isMatch: expected a string subject, but got type ${typeof subject}`
        );
      }
      if (!regex.test(subject)) {
        throw new Error(`Expected '${subject}' to match ${regex}`);
      }
      return api;
    },

    /**
     * Assert that substring appears in subject (when subject is string).
     * @param {string} substr
     * @returns {ExpectAPI}
     */
    isSubStr(substr) {
      if (typeof subject !== "string") {
        throw new Error(
          `isSubStr: expected a string subject, but got type ${typeof subject}`
        );
      }
      if (!subject.includes(substr)) {
        throw new Error(
          `Expected '${subject}' to contain substring '${substr}'`
        );
      }
      return api;
    },
  };

  // Define the .not API dynamically
  const negatedApi = {};
  for (const key of Object.keys(api)) {
    const fn = api[key];
    if (typeof fn === "function") {
      negatedApi[key] = (...args) => {
        try {
          fn(...args);
        } catch {
          return negatedApi; // Assertion failed as expected
        }
        throw new Error(
          `Negation failed: ${key}(${args
            .map(a => JSON.stringify(a))
            .join(", ")})`
        );
      };
    }
  }

  // Add .not to the negated API to allow chaining
  negatedApi.not = api;

  // Attach .not to the main API
  Object.defineProperty(api, "not", {
    value: negatedApi,
    enumerable: false,
  });

  return api;
}
