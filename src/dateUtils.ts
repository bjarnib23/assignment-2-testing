import {
  addDays,
  addMonths,
  addYears,
  getYear,
  isAfter,
  isBefore,
  isSameDay as isSameDayFn,
} from "date-fns";
import { DATE_UNIT_TYPES } from "./constants";

export function getCurrentYear(): number {
  return getYear(new Date());
}

export function add(
  date: Date,
  amount: number,
  type: string = DATE_UNIT_TYPES.DAYS
): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    throw new Error("Invalid amount provided");
  }

  const base = new Date(date.getTime());

  switch (type) {
    case DATE_UNIT_TYPES.DAYS:
      return addDays(base, amount);
    case DATE_UNIT_TYPES.MONTHS:
      return addMonths(base, amount);
    case DATE_UNIT_TYPES.YEARS:
      return addYears(base, amount);
    default:
      return base;
  }
}

export function isWithinRange(date: Date, from: Date, to: Date): boolean {
  if (isAfter(from, to)) {
    throw new Error("Invalid range: from date must be before to date");
  }

  return isAfter(date, from) && isBefore(date, to);
}

export function isDateBefore(date: Date, compareDate: Date): boolean {
  return isBefore(date, compareDate);
}

export function isSameDay(date: Date, compareDate: Date): boolean {
  return isSameDayFn(date, compareDate);
}

// Simulates fetching holidays from an API
export async function getHolidays(year: number): Promise<Date[]> {
  return new Promise<Date[]>((resolve) => {
    setTimeout(() => {
      resolve([
        new Date(year, 0, 1), // New Year's Day
        new Date(year, 11, 25), // Christmas
        new Date(year, 11, 31), // New Year's Eve
      ]);
    }, 100);
  });
}

export async function isHoliday(date: Date): Promise<boolean> {
  const holidays = await getHolidays(date.getFullYear());
  return holidays.some((holiday) => isSameDay(date, holiday));
}
