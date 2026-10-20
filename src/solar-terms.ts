import * as Astronomy from "astronomy-engine";

/** 24 solar terms starting from 小寒 (the first one in a Gregorian year). */
export const SOLAR_TERMS = [
  { zh: "小寒", zhHant: "小寒", en: "Minor Cold", longitude: 285 },
  { zh: "大寒", zhHant: "大寒", en: "Major Cold", longitude: 300 },
  { zh: "立春", zhHant: "立春", en: "Start of Spring", longitude: 315 },
  { zh: "雨水", zhHant: "雨水", en: "Rain Water", longitude: 330 },
  { zh: "惊蛰", zhHant: "驚蟄", en: "Awakening of Insects", longitude: 345 },
  { zh: "春分", zhHant: "春分", en: "Spring Equinox", longitude: 0 },
  { zh: "清明", zhHant: "清明", en: "Pure Brightness", longitude: 15 },
  { zh: "谷雨", zhHant: "穀雨", en: "Grain Rain", longitude: 30 },
  { zh: "立夏", zhHant: "立夏", en: "Start of Summer", longitude: 45 },
  { zh: "小满", zhHant: "小滿", en: "Grain Buds", longitude: 60 },
  { zh: "芒种", zhHant: "芒種", en: "Grain in Ear", longitude: 75 },
  { zh: "夏至", zhHant: "夏至", en: "Summer Solstice", longitude: 90 },
  { zh: "小暑", zhHant: "小暑", en: "Minor Heat", longitude: 105 },
  { zh: "大暑", zhHant: "大暑", en: "Major Heat", longitude: 120 },
  { zh: "立秋", zhHant: "立秋", en: "Start of Autumn", longitude: 135 },
  { zh: "处暑", zhHant: "處暑", en: "End of Heat", longitude: 150 },
  { zh: "白露", zhHant: "白露", en: "White Dew", longitude: 165 },
  { zh: "秋分", zhHant: "秋分", en: "Autumn Equinox", longitude: 180 },
  { zh: "寒露", zhHant: "寒露", en: "Cold Dew", longitude: 195 },
  { zh: "霜降", zhHant: "霜降", en: "Frost's Descent", longitude: 210 },
  { zh: "立冬", zhHant: "立冬", en: "Start of Winter", longitude: 225 },
  { zh: "小雪", zhHant: "小雪", en: "Minor Snow", longitude: 240 },
  { zh: "大雪", zhHant: "大雪", en: "Major Snow", longitude: 255 },
  { zh: "冬至", zhHant: "冬至", en: "Winter Solstice", longitude: 270 },
] as const;

export interface SolarTermMoment {
  index: number;
  zh: string;
  zhHant: string;
  en: string;
  longitude: number;
  /** ISO 8601 UTC, second precision. */
  utc: string;
  /** Beijing time (UTC+8, no DST) "YYYY-MM-DD HH:mm:ss". */
  beijing: string;
}

function fmt(ms: number, offsetH: number): string {
  return new Date(Math.round(ms / 1000) * 1000 + offsetH * 3600e3).toISOString().replace("T", " ").slice(0, 19);
}

/** Exact moments of the 24 solar terms in a Gregorian year (apparent geocentric solar longitude). */
export function solarTerms(year: number): SolarTermMoment[] {
  if (!Number.isInteger(year) || year < 1 || year > 9999) throw new RangeError("year must be an integer 1–9999");
  return SOLAR_TERMS.map((t, i) => {
    // Each term falls roughly between day 15i-10 and 15i+30 of the year.
    const start = Astronomy.MakeTime(new Date(Date.UTC(year, 0, 1) + (i * 15.2 - 8) * 86400e3));
    const hit = Astronomy.SearchSunLongitude(t.longitude, start, 20);
    if (!hit) throw new Error(`term not found: ${year} ${t.en}`);
    const ms = hit.date.getTime();
    return { index: i, ...t, utc: fmt(ms, 0).replace(" ", "T") + "Z", beijing: fmt(ms, 8) };
  });
}

/** Find one solar term by Chinese (simplified/traditional) or English name. */
export function solarTerm(year: number, name: string): SolarTermMoment {
  const n = name.trim().toLowerCase();
  const r = solarTerms(year).find((t) => t.zh === name || t.zhHant === name || t.en.toLowerCase() === n);
  if (!r) throw new RangeError(`unknown solar term: ${name}`);
  return r;
}
