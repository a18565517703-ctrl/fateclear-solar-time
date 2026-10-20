import { describe, it, expect } from "vitest";
import { SolarTerm } from "tyme4ts";
import { trueSolarTime, equationOfTime, solarTerms, solarTerm, chinaDstStatus, CHINA_DST } from "../src/index.js";

describe("equation of time", () => {
  it("matches known values (precise)", () => {
    // early Nov max ≈ +16.4 min, mid Feb min ≈ −14.2 min
    expect(equationOfTime(new Date("2024-11-03T12:00:00Z"))).toBeCloseTo(16.4, 0);
    expect(equationOfTime(new Date("2024-02-11T12:00:00Z"))).toBeCloseTo(-14.2, 0);
  });
  it("simple series stays within 2 min of precise", () => {
    for (let d = 0; d < 365; d += 7) {
      const t = new Date(Date.UTC(2000, 0, 1) + d * 864e5);
      expect(Math.abs(equationOfTime(t, "simple") - equationOfTime(t))).toBeLessThan(2);
    }
  });
});

describe("true solar time", () => {
  it("Beijing 116.4E, 1990-03-12 12:00", () => {
    const r = trueSolarTime({ year: 1990, month: 3, day: 12, hour: 12, minute: 0, longitude: 116.4 });
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(-14.4, 2);
    expect(r.equationOfTimeMinutes).toBeCloseTo(-10.0, 0);
    expect(r.trueSolarText.slice(0, 16)).toBe("1990-03-12 11:35");
  });
  it("Urumqi crosses to previous day", () => {
    const r = trueSolarTime({ year: 2000, month: 1, day: 1, hour: 0, minute: 30, longitude: 87.6 });
    expect(r.trueSolar.day).toBe(31);
  });
  it("auto DST in summer 1988", () => {
    const r = trueSolarTime({ year: 1988, month: 7, day: 1, hour: 12, minute: 0, longitude: 120 });
    expect(r.dstStatus).toBe("dst");
    expect(r.dstCorrectionMinutes).toBe(-60);
    expect(r.utc).toBe("1988-07-01T03:00:00Z");
  });
  it("dst:false ignores it, other offsets skip it", () => {
    expect(trueSolarTime({ year: 1988, month: 7, day: 1, hour: 12, minute: 0, longitude: 120, dst: false }).dstCorrectionMinutes).toBe(0);
    expect(trueSolarTime({ year: 1988, month: 7, day: 1, hour: 12, minute: 0, longitude: 135, utcOffset: 9 }).dstStatus).toBe("standard");
  });
  it("western hemisphere", () => {
    const r = trueSolarTime({ year: 2020, month: 6, day: 1, hour: 12, minute: 0, longitude: -74, utcOffset: -4 });
    expect(r.utc).toBe("2020-06-01T16:00:00Z");
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(-56, 5);
  });
  it("rejects bad longitude", () => {
    expect(() => trueSolarTime({ year: 2020, month: 1, day: 1, hour: 0, minute: 0, longitude: 200 })).toThrow();
  });
});

describe("China DST 1986–1991", () => {
  it("has six periods matching the tz database", () => {
    expect(CHINA_DST).toHaveLength(6);
    for (const p of CHINA_DST) {
      const fmt = (ms: number) => new Intl.DateTimeFormat("en", { timeZone: "Asia/Shanghai", timeZoneName: "shortOffset" }).format(new Date(ms)).split(" ").pop();
      const s = Date.parse(p.startUtc), e = Date.parse(p.endUtc);
      expect(fmt(s - 1000)).toBe("GMT+8"); expect(fmt(s)).toBe("GMT+9");
      expect(fmt(e - 1000)).toBe("GMT+9"); expect(fmt(e)).toBe("GMT+8");
    }
  });
  it("edge cases", () => {
    expect(chinaDstStatus({ year: 1990, month: 4, day: 15, hour: 2, minute: 30 })).toBe("nonexistent");
    expect(chinaDstStatus({ year: 1990, month: 9, day: 16, hour: 1, minute: 30 })).toBe("ambiguous");
    expect(chinaDstStatus({ year: 1990, month: 9, day: 16, hour: 2, minute: 30 })).toBe("standard");
    expect(chinaDstStatus({ year: 1992, month: 7, day: 1, hour: 12, minute: 0 })).toBe("standard");
  });
});

describe("solar terms", () => {
  it("returns 24 terms in order within the year", () => {
    const t = solarTerms(2026);
    expect(t).toHaveLength(24);
    expect(t[0].zh).toBe("小寒");
    for (let i = 1; i < 24; i++) expect(t[i].utc > t[i - 1].utc).toBe(true);
    expect(t.every((x) => x.utc.startsWith("2026"))).toBe(true);
  });
  it("立春 1990 matches the well-known moment", () => {
    const ms = Date.parse(solarTerm(1990, "立春").utc);
    expect(Math.abs(ms - Date.parse("1990-02-04T02:14:00Z")) / 60e3).toBeLessThan(1);
  });
  it("agrees with tyme4ts within 2 minutes, 1900–2100 sample", () => {
    let worst = 0;
    for (let y = 1900; y <= 2100; y += 7) {
      const ours = solarTerms(y);
      for (let i = 0; i < 24; i++) {
        // tyme4ts index 0 = 冬至 of the previous year; 小寒 = index 1
        const ref = SolarTerm.fromIndex(y, i + 1).getJulianDay().getSolarTime();
        const refMs = Date.UTC(ref.getYear(), ref.getMonth() - 1, ref.getDay(), ref.getHour() - 8, ref.getMinute(), ref.getSecond());
        const d = Math.abs(Date.parse(ours[i].utc) - refMs) / 60e3;
        worst = Math.max(worst, d);
      }
    }
    expect(worst).toBeLessThan(2);
  });
  it("accepts names in three scripts", () => {
    expect(solarTerm(2000, "驚蟄").zh).toBe("惊蛰");
    expect(solarTerm(2000, "winter solstice").zh).toBe("冬至");
  });
});
