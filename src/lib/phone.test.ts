import { describe, it, expect } from "vitest";
import { normalizePhone, telHref, isMobilePhone } from "./phone";

describe("phone", () => {
  it("adds + to 7XXXXXXXXXX", () => expect(telHref("77772502020")).toBe("tel:+77772502020"));
  it("converts 8XXXXXXXXXX", () => expect(normalizePhone("8 775 319 18 49")).toBe("77753191849"));
  it("treats zeros as empty", () => {
    expect(normalizePhone("00000000")).toBeNull();
    expect(normalizePhone("70000000000")).toBeNull();
  });
  it("detects mobile", () => {
    expect(isMobilePhone("+7 707 737 46 77")).toBe(true);
    expect(isMobilePhone("87292123456")).toBe(false);
  });
});
