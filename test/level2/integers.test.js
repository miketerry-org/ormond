// integers.test.js

describe("Numbers - Basic Testing", () => {
  it("should confirm integers are equal", () => {
    const a = 42;
    const b = 42;
    expect(a).isType("number").isEQ(b);
  });

  it("should confirm integer comparison operators", () => {
    const a = 10;
    const b = 20;
    expect(a).isLT(b).isLE(b);
    expect(b).isGT(a).isGE(a);
  });

  it("should detect inequality", () => {
    const x = 100;
    const y = 200;
    expect(x).not.isEQ(y);
  });

  it("should test float values approximately", () => {
    const pi = 3.14159;
    const rounded = Math.round(pi * 100) / 100;
    expect(rounded).isEQ(3.14);
  });

  it("should be between bounds (inclusive)", () => {
    const temperature = 72;
    expect(temperature).isBetween(70, 75);
  });

  it("should fail when expected", () => {
    const wrong = 999;
    try {
      expect(wrong).isBetween(1, 100); // should fail
    } catch (err) {
      expect(err.message).isSubStr("between");
    }
  });
});
