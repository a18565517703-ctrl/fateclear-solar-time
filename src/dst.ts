/** China daylight saving time, 1986–1991 (wall clock, UTC+8 standard / UTC+9 DST). */
export interface ChinaDstPeriod {
  year: number;
  /** Local standard time when clocks moved forward 02:00 → 03:00. */
  start: string;
  /** Local DST time when clocks moved back 02:00 → 01:00. */
  end: string;
  startUtc: string;
  endUtc: string;
}

export const CHINA_DST: readonly ChinaDstPeriod[] = [
  { year: 1986, start: "1986-05-04 02:00", end: "1986-09-14 02:00", startUtc: "1986-05-03T18:00:00Z", endUtc: "1986-09-13T17:00:00Z" },
  { year: 1987, start: "1987-04-12 02:00", end: "1987-09-13 02:00", startUtc: "1987-04-11T18:00:00Z", endUtc: "1987-09-12T17:00:00Z" },
  { year: 1988, start: "1988-04-17 02:00", end: "1988-09-11 02:00", startUtc: "1988-04-16T18:00:00Z", endUtc: "1988-09-10T17:00:00Z" },
  { year: 1989, start: "1989-04-16 02:00", end: "1989-09-17 02:00", startUtc: "1989-04-15T18:00:00Z", endUtc: "1989-09-16T17:00:00Z" },
  { year: 1990, start: "1990-04-15 02:00", end: "1990-09-16 02:00", startUtc: "1990-04-14T18:00:00Z", endUtc: "1990-09-15T17:00:00Z" },
  { year: 1991, start: "1991-04-14 02:00", end: "1991-09-15 02:00", startUtc: "1991-04-13T18:00:00Z", endUtc: "1991-09-14T17:00:00Z" },
];

export type DstStatus = "standard" | "dst" | "ambiguous" | "nonexistent";

/** Classify a China wall-clock time (as written on a birth record). */
export function chinaDstStatus(wall: WallTime): DstStatus {
  const p = CHINA_DST.find((d) => d.year === wall.year);
  if (!p) return "standard";
  const t = wallMs(wall);
  const s = Date.parse(p.start.replace(" ", "T") + ":00Z");
  const e = Date.parse(p.end.replace(" ", "T") + ":00Z");
  const H = 3600e3;
  if (t >= s && t < s + H) return "nonexistent"; // 02:00–02:59 skipped
  if (t >= e - H && t < e) return "ambiguous"; // 01:00–01:59 happened twice
  if (t >= s + H && t < e - H) return "dst";
  return "standard";
}

export interface WallTime { year: number; month: number; day: number; hour: number; minute: number; second?: number }

export function wallMs(w: WallTime): number {
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second ?? 0);
}
