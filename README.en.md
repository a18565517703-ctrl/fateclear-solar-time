[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

# fateclear-solar-time

**Convert clock time and longitude into local apparent solar time, with every correction visible.**

A small TypeScript library for calendar applications, time-conversion tools, and AI assistants. Supply a date, clock time, longitude, and UTC offset to get apparent solar time, longitude correction, the equation of time, and daylight saving time status. You can also look up the 24 Chinese solar terms. An MCP server is included.

[![CI](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Maintained by [拨云 FateClear](https://fateclear.com) · [Online BaZi chart](https://fateclear.com/bazi) · [Project updates on X](https://x.com/liu_xiaoyu27334)

## See the input and result

After installation, call the library from a TypeScript project with ESM support:

```ts
import { trueSolarTime } from "fateclear-solar-time";

const r = trueSolarTime({
  year: 1990, month: 3, day: 12,
  hour: 23, minute: 30,
  longitude: 116.4,
});

r.longitudeCorrectionMinutes; // -14.4
r.dstCorrectionMinutes;       // 0
r.trueSolarText;              // YYYY-MM-DD HH:mm:ss
r.equationOfTimeMinutes;
```

The default standard UTC offset is +8 hours. At 116.4° east, the longitude correction relative to that offset is `116.4 × 4 − 8 × 60 = −14.4` minutes. Adding the equation of time for that date gives local apparent solar time. Separate correction fields let your application explain the conversion.

The date is retained from the repository's existing public example to illustrate the API. See [src/solar-time.ts](src/solar-time.ts) for the full return type.

## Quick start

You need Git, Node.js 18 or later, npm, and a project with ESM support.

```sh
npm install github:xiaoyu312/fateclear-solar-time
```

This installs the source package from GitHub. The `prepare` step compiles TypeScript during installation, so the declared dependencies must be installable. [v0.1.0](https://github.com/xiaoyu312/fateclear-solar-time/releases/tag/v0.1.0) is released, with no additional downloadable assets. To try birthday charting and the solar-time display online, visit [FateClear](https://fateclear.com/bazi).

## Capabilities

| Entry point | Input and result |
| --- | --- |
| `trueSolarTime` | Clock date and time, longitude, and options → local apparent and mean solar time, UTC, corrections in minutes, and DST status |
| `solarTerms` / `solarTerm` | Gregorian year, optionally with a term name → solar-term moments; accepts simplified Chinese, traditional Chinese, and English names |
| `chinaDstStatus` / `CHINA_DST` | Chinese clock time → DST status; or read the six annual start/end periods for 1986–1991 |
| MCP server | Exposes these conversions and queries to compatible clients over stdio |

## Library usage and options

```ts
import { trueSolarTime, solarTerms, solarTerm, chinaDstStatus } from "fateclear-solar-time";

trueSolarTime({
  year: 1988, month: 7, day: 1,
  hour: 12, minute: 0, longitude: 120,
}).dstCorrectionMinutes; // -60

solarTerms(2026).length; // 24
solarTerm(1990, "立春").beijing;
solarTerm(1990, "Start of Spring").utc;

chinaDstStatus({
  year: 1990, month: 9, day: 16, hour: 1, minute: 30,
}); // "ambiguous"
```

`trueSolarTime` parameters:

| Parameter | Meaning |
| --- | --- |
| `year` / `month` / `day` / `hour` / `minute` | Gregorian date and time as recorded on the clock; months are 1–12 |
| `second` | Optional; defaults to 0 |
| `longitude` | Required, from −180 to 180 degrees; east positive, west negative |
| `latitude` | Optional; retained for records and not used in the calculation |
| `utcOffset` | Standard offset from UTC in hours, default 8; DST is handled separately by `dst` |
| `dst` | `"auto"` (default; applies China's 1986–1991 rules for UTC+8), `true` (force a one-hour subtraction), or `false` (no DST correction) |
| `eot` | `"precise"` (default; astronomical equation of time) or `"simple"` (a three-term approximation) |

In the result, `trueSolar` contains date and time fields; `trueSolarText` and `meanSolarText` are formatted times, and `utc` is the corresponding UTC instant. `dstStatus` identifies the DST status. `dstCorrectionMinutes`, `longitudeCorrectionMinutes`, `equationOfTimeMinutes`, and `totalCorrectionMinutes` expose each correction and their total.

`dstStatus` is determined by `utcOffset` and the built-in rules, independently of a manual `dst` override. It may still report `dst` when correction is disabled. Read `dstCorrectionMinutes` to see the correction actually applied.

Solar-term results contain `index`, `zh`, `zhHant`, `en`, `longitude`, `utc`, and `beijing`. Each year starts with Minor Cold (小寒), with `index` from 0 to 23. `beijing` always uses fixed UTC+8 without DST.

## Use it from an AI assistant through MCP

Add this configuration to an MCP client that supports stdio. The client must be able to find Git, Node.js, and `npx`; the first launch may fetch the GitHub source, download dependencies, and compile the package.

```json
{
  "mcpServers": {
    "fateclear-solar-time": {
      "command": "npx",
      "args": ["-y", "github:xiaoyu312/fateclear-solar-time"]
    }
  }
}
```

| Tool | Purpose |
| --- | --- |
| `true_solar_time` | Convert to apparent solar time using `datetime`, `longitude`, and optional parameters |
| `solar_terms` | Query a full year or a single term with `year` and optional `name` |
| `china_dst` | Return the six-year table with no arguments, or a status when `datetime` is supplied |

Use `YYYY-MM-DD HH:mm` for `datetime`; `true_solar_time` also accepts a `T` separator and optional seconds. Configuration file locations depend on the client. Parameter definitions are in [src/mcp.ts](src/mcp.ts).

## Limits and verification scope

- The library converts time and queries calendar moments. It does not produce a complete BaZi chart or make interpretive judgments.
- Automatic DST handling contains only China's 1986–1991 rules, applied when `utcOffset` is 8. It is not a global historical time-zone database and does not infer a country from longitude. For other regions, determine the standard offset and DST policy separately.
- DST statuses are `standard`, `dst`, `nonexistent` (a skipped clock time), and `ambiguous` (a repeated clock time). Automatic mode subtracts one hour for `dst` and `nonexistent`, and none for `ambiguous`. A status flag does not resolve the ambiguity; the caller must confirm times around transitions.
- Solar terms are calculated from the Sun's apparent ecliptic longitude using astronomy-engine. Times are formatted to seconds, which is not a guarantee of sub-second accuracy. The source tests sample 1900–2100 at seven-year intervals against tyme4ts with a two-minute threshold; this is not a guarantee for every year.
- The `simple` equation of time is an approximation. Existing tests sample the year 2000 at seven-day intervals against `precise` with a two-minute threshold. This does not establish an error bound for all dates.
- DST tests check annual transition boundaries against IANA `Asia/Shanghai` rules. Test definitions and CI configuration are available in the repository. Installation, build, tests, MCP startup, and the online page were not rerun or validated during this documentation update.

With a repository checkout, run these development checks from its root. CI is configured for Node.js 18, 20, and 22; that list does not mean these environments were revalidated in this update.

```sh
npm ci
npm run typecheck
npm test
npm run build
```

## Documentation and sources

- [API exports](src/index.ts) · [Solar-time implementation](src/solar-time.ts) · [Solar-term implementation](src/solar-terms.ts) · [DST table](src/dst.ts)
- [Test coverage](test/solar.test.ts) · [Commands and dependencies](package.json) · [CI configuration](.github/workflows/ci.yml)
- [Companion calendar dataset](https://github.com/xiaoyu312/fateclear-calendar-data): solar terms, sexagenary pillars, and lunar dates for 1900–2100 in CSV / JSON, under a separate CC BY 4.0 data license.

## License and author

The library is [MIT licensed](LICENSE). Sources and licenses for the astronomy algorithms, MCP SDK, build tools, and test dependencies are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), along with the source note for China's DST table.

Try birthday charting and interpretations at [FateClear](https://fateclear.com), or follow new projects and updates on [X](https://x.com/liu_xiaoyu27334).
