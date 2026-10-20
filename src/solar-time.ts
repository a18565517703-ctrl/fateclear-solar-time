import * as Astronomy from "astronomy-engine";
import { chinaDstStatus, wallMs, type WallTime, type DstStatus } from "./dst.js";

export type EotMethod = "precise" | "simple";

export interface TrueSolarTimeInput extends WallTime {
  /** East longitude in degrees (west negative). */
  longitude: number;
  /** Latitude in degrees; not needed for the result, kept for records. */
  latitude?: number;
  /** UTC offset of the clock in hours. Default 8 (China Standard Time). */
  utcOffset?: number;
  /**
   * China 1986–1991 DST handling for a UTC+8 clock:
   * "auto" (default) subtracts 1 hour inside the DST period,
   * true forces the 1-hour correction, false ignores DST.
   */
  dst?: "auto" | boolean;
  /** Equation of time: "precise" (astronomical, default) or "simple" (short series). */
  eot?: EotMethod;
}

export interface TrueSolarTimeResult {
  /** True (apparent) solar time as wall-clock fields. */
  trueSolar: Required<WallTime>;
  /** "YYYY-MM-DD HH:mm:ss" */
  trueSolarText: string;
  /** Mean local time (longitude correction only). */
  meanSolarText: string;
  utc: string;
  dstStatus: DstStatus;
  dstCorrectionMinutes: number;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
}

/** Equation of time in minutes (apparent − mean solar time) at a UTC instant. */
export function equationOfTime(date: Date, method: EotMethod = "precise"): number {
  if (method === "simple") {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const n = Math.floor((date.getTime() - start) / 86400000);
    const b = (2 * Math.PI * (n - 81)) / 364;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  }
  // Greenwich hour angle of the true Sun vs. mean solar time at Greenwich.
  const time = Astronomy.MakeTime(date);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, time, new Astronomy.Observer(0, 0, 0), true, true);
  const gast = Astronomy.SiderealTime(time); // hours
  let ha = gast - eq.ra; // Greenwich hour angle of the Sun, hours
  const utHours = (date.getTime() / 3600e3) % 24;
  let diff = (ha + 12 - utHours) * 60;
  diff = ((diff % 1440) + 1440 + 720) % 1440 - 720;
  return diff;
}

function fields(ms: number): Required<WallTime> {
  const d = new Date(Math.round(ms / 1000) * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds() };
}
const p2 = (n: number) => String(n).padStart(2, "0");
export function formatWall(f: Required<WallTime>): string {
  return `${f.year}-${p2(f.month)}-${p2(f.day)} ${p2(f.hour)}:${p2(f.minute)}:${p2(f.second)}`;
}

/** Convert a clock time at a place into local true solar time. */
export function trueSolarTime(input: TrueSolarTimeInput): TrueSolarTimeResult {
  if (!Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180) throw new RangeError("longitude must be in [-180, 180]");
  const offset = input.utcOffset ?? 8;
  const dstOpt = input.dst ?? "auto";
  const status = offset === 8 ? chinaDstStatus(input) : "standard";
  let dstMin = 0;
  if (dstOpt === true) dstMin = 60;
  else if (dstOpt === "auto" && (status === "dst" || status === "nonexistent")) dstMin = 60;
  const wall = wallMs(input);
  const utcMs = wall - (offset * 60 + dstMin) * 60e3;
  const lonMin = input.longitude * 4 - offset * 60;
  const eot = equationOfTime(new Date(utcMs), input.eot ?? "precise");
  const meanMs = utcMs + input.longitude * 4 * 60e3;
  const trueMs = meanMs + eot * 60e3;
  const t = fields(trueMs);
  return {
    trueSolar: t,
    trueSolarText: formatWall(t),
    meanSolarText: formatWall(fields(meanMs)),
    utc: new Date(utcMs).toISOString().replace(".000", ""),
    dstStatus: status,
    dstCorrectionMinutes: dstMin ? -dstMin : 0,
    longitudeCorrectionMinutes: round(lonMin),
    equationOfTimeMinutes: round(eot),
    totalCorrectionMinutes: round(lonMin + eot - dstMin),
  };
}
const round = (x: number) => Math.round(x * 100) / 100;
