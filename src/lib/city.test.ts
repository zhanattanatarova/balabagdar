// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { currentCity, selectCity, subscribeCity } from "./city";

describe("selected city", () => {
  beforeEach(() => { selectCity("Актау"); });
  it("persists a manual selection for the next visit", () => {
    selectCity("Алматы");
    expect(localStorage.getItem("bb_city")).toBe("Алматы");
    expect(currentCity()).toBe("Алматы");
  });
  it("notifies every subscribed view and stops after unsubscribe", () => {
    const observed: string[] = [];
    const unsubscribe = subscribeCity(() => observed.push(currentCity()));
    selectCity("Астана");
    unsubscribe();
    selectCity("Актау");
    expect(observed).toEqual(["Астана"]);
  });
});