import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentYear,
  add,
  isWithinRange,
  isDateBefore,
  isSameDay,
  getHolidays,
  isHoliday,
} from "../dateUtils";

describe("dateUtils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });


  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getCurrentYear()", () => {
    it("returns the current year (deterministic via fake timers)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-02-10T12:00:00Z"));

      expect(getCurrentYear()).toBe(2024);
    });
  });

  describe("add(date, amount, type)", () => {
    it("adds days correctly", () => {
      const base = new Date("2024-01-01T00:00:00Z");
      const result = add(base, 5, "days");
      expect(result.toISOString()).toBe("2024-01-06T00:00:00.000Z");
    });

    it("adds months correctly (simple case)", () => {
      const base = new Date("2024-01-15T00:00:00Z");
      const result = add(base, 1, "months");
      expect(result.toISOString()).toBe("2024-02-15T00:00:00.000Z");
    });

    it("adds years correctly", () => {
      const base = new Date("2024-01-01T00:00:00Z");
      const result = add(base, 2, "years");
      expect(result.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    });

    it("supports negative amounts (subtracts time)", () => {
      const base = new Date("2024-01-10T00:00:00Z");
      const result = add(base, -3, "days");
      expect(result.toISOString()).toBe("2024-01-07T00:00:00.000Z");
    });

    it("does not throw on invalid type (returns original date unchanged)", () => {
      const base = new Date("2024-01-01T00:00:00Z");

      expect(() => add(base, 1, "bananas" as any)).not.toThrow();

      const result = add(base, 1, "bananas" as any);

      expect(result.toISOString()).toBe(base.toISOString());
    });


    it("throws on invalid date input", () => {
      const badDate = new Date("not-a-date");

      expect(() => add(badDate, 1, "days")).toThrow();
    });

    it("does not mutate the original date object", () => {
      const base = new Date("2024-01-01T00:00:00Z");
      const baseIso = base.toISOString();

      add(base, 1, "days");
      expect(base.toISOString()).toBe(baseIso);
    });
  });

  describe("isWithinRange(date, from, to)", () => {
    it("returns true when date is strictly between from and to", () => {
      const from = new Date("2024-01-01T00:00:00Z");
      const to = new Date("2024-01-10T00:00:00Z");
      const date = new Date("2024-01-05T00:00:00Z");

      expect(isWithinRange(date, from, to)).toBe(true);
    });

    it("handles boundary: date equals from", () => {
      const from = new Date("2024-01-01T00:00:00Z");
      const to = new Date("2024-01-10T00:00:00Z");
      const date = new Date("2024-01-01T00:00:00Z");

      expect(isWithinRange(date, from, to)).toBe(false);
    });

    it("handles boundary: date equals to", () => {
      const from = new Date("2024-01-01T00:00:00Z");
      const to = new Date("2024-01-10T00:00:00Z");
      const date = new Date("2024-01-10T00:00:00Z");

      expect(isWithinRange(date, from, to)).toBe(false);
    });

    it("throws if range is invalid (from is after to)", () => {
      const from = new Date("2024-01-10T00:00:00Z");
      const to = new Date("2024-01-01T00:00:00Z");
      const date = new Date("2024-01-05T00:00:00Z");

      expect(() => isWithinRange(date, from, to)).toThrow();
    });
  });

  describe("isDateBefore(date, compareDate)", () => {
    it("returns true if date is before compareDate", () => {
      const a = new Date("2024-01-01T00:00:00Z");
      const b = new Date("2024-01-02T00:00:00Z");

      expect(isDateBefore(a, b)).toBe(true);
    });

    it("returns false if date is after compareDate", () => {
      const a = new Date("2024-01-03T00:00:00Z");
      const b = new Date("2024-01-02T00:00:00Z");

      expect(isDateBefore(a, b)).toBe(false);
    });

    it("returns false if same moment", () => {
      const a = new Date("2024-01-02T00:00:00Z");
      const b = new Date("2024-01-02T00:00:00Z");

      expect(isDateBefore(a, b)).toBe(false);
    });
  });

  describe("isSameDay(date, compareDate)", () => {
    it("returns true for dates on the same calendar day", () => {
      const a = new Date("2024-01-02T01:00:00Z");
      const b = new Date("2024-01-02T23:59:59Z");

      expect(isSameDay(a, b)).toBe(true);
    });

    it("returns false for dates on different days", () => {
      const a = new Date("2024-01-02T23:59:59Z");
      const b = new Date("2024-01-03T00:00:00Z");

      expect(isSameDay(a, b)).toBe(false);
    });
  });

    describe("getHolidays(year) (async)", () => {
    it("returns an array of holiday dates for the year", async () => {
      const holidays = await getHolidays(2024);

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);
    });

    it("returns Invalid Dates when year is invalid (does not throw)", async () => {
      const holidays = await getHolidays(NaN as any);

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);

      for (const d of holidays as any[]) {
        expect(d).toBeInstanceOf(Date);
        expect(Number.isNaN(d.getTime())).toBe(true);
      }
    });
  });

  describe("isHoliday(date) (async)", () => {
    it("returns true when date is a holiday", async () => {
      const holidays = await getHolidays(2024);
      const firstHoliday = holidays[0];

      expect(await isHoliday(firstHoliday as any)).toBe(true);
    });

    it("returns false when date is not a holiday", async () => {
      const notHoliday = new Date("2024-07-02T00:00:00Z");
      expect(await isHoliday(notHoliday)).toBe(false);
    });
  });
});
