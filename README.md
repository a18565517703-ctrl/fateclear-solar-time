# fateclear-solar-time

[![CI](https://github.com/a18565517703-ctrl/fateclear-solar-time/actions/workflows/ci.yml/badge.svg)](https://github.com/a18565517703-ctrl/fateclear-solar-time/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**中文** | [English](#english)

真太阳时、二十四节气精确时刻、中国 1986–1991 年夏令时，一个小 TypeScript 库，附带 MCP 服务，AI 助手可以直接调用。由 [拨云 FateClear](https://fateclear.com) 维护。

**在线演示：** [拨云 FateClear 八字排盘](https://fateclear.com/bazi)，填出生时间和地点，会显示换算后的真太阳时。

## 能做什么

- **真太阳时**：钟表时间 + 经度 → 当地真太阳时。包含经度修正（每度 4 分钟）和均时差（太阳实际位置和平均位置的差，一年里在 −14 到 +16 分钟之间）。
- **二十四节气**：任意公历年份 24 个节气的交节时刻，精确到秒，给出 UTC 和北京时间。按太阳视黄经计算。
- **中国夏令时**：1986–1991 年每年的起止时间。出生时间落在夏令时里会自动减 1 小时，也标出“不存在”（拨快跳过的那 1 小时）和“有歧义”（拨回重复的那 1 小时）的时刻。

## 安装

```bash
npm install fateclear-solar-time
```

## 用法

```ts
import { trueSolarTime, solarTerms, solarTerm, chinaDstStatus } from "fateclear-solar-time";

// 1990-03-12 23:30 出生在北京（东经 116.4°）
const r = trueSolarTime({ year: 1990, month: 3, day: 12, hour: 23, minute: 30, longitude: 116.4 });
r.trueSolarText;              // "1990-03-12 23:05:50"
r.longitudeCorrectionMinutes; // -14.4
r.equationOfTimeMinutes;      // 约 -9.8

// 1988 年夏天的钟表时间会自动扣掉夏令时
trueSolarTime({ year: 1988, month: 7, day: 1, hour: 12, minute: 0, longitude: 120 }).dstCorrectionMinutes; // -60

// 2026 年的 24 节气
solarTerms(2026).map((t) => `${t.zh} ${t.beijing}`);
solarTerm(1990, "立春").beijing; // "1990-02-04 10:13:58"
```

参数说明：

| 参数 | 说明 |
|---|---|
| `longitude` | 东经为正，西经为负 |
| `utcOffset` | 钟表所在时区，默认 8（北京时间） |
| `dst` | `"auto"`（默认，按 1986–1991 年表自动判断）、`true`（强制减 1 小时）、`false`（不处理） |
| `eot` | `"precise"`（默认，按天文位置算）或 `"simple"`（三项近似公式，和精确值差 2 分钟以内） |

## MCP 服务

```json
{
  "mcpServers": {
    "fateclear-solar-time": { "command": "npx", "args": ["-y", "-p", "fateclear-solar-time", "fateclear-solar-time-mcp"] }
  }
}
```

提供三个工具：`true_solar_time`、`solar_terms`、`china_dst`。

## 精度

- 节气时刻用 astronomy-engine 算太阳视黄经，1900–2100 年抽样和 tyme4ts 对比，差不到 2 分钟。
- 夏令时表在测试里和 IANA 时区库逐条核对。
- 真太阳时只做时间换算，不涉及任何命理判断。

## 协议

MIT。依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。配套数据集：[fateclear-calendar-data](https://github.com/a18565517703-ctrl/fateclear-calendar-data)（1900–2100 年节气、干支、农历）。

---

<a id="english"></a>
## English

A small TypeScript library for **true (apparent) solar time**, **exact moments of the 24 Chinese solar terms**, and **China's 1986–1991 daylight saving time**, with an MCP server so AI assistants can call it directly. Maintained by [拨云 FateClear](https://fateclear.com).

**Live demo:** [FateClear BaZi chart](https://fateclear.com/bazi) shows the converted true solar time for any birth time and place.

### Features

- **True solar time**: clock time + longitude → local apparent solar time, with longitude correction (4 min per degree) and the equation of time (−14 to +16 min over the year).
- **24 solar terms**: exact moments (to the second) for any Gregorian year, in UTC and Beijing time, from the Sun's apparent ecliptic longitude.
- **China DST 1986–1991**: start/end of each year's DST; clock times inside DST are corrected by −1 hour, and skipped or repeated hours are flagged as `nonexistent` / `ambiguous`.

### Install & use

```bash
npm install fateclear-solar-time
```

```ts
import { trueSolarTime, solarTerms } from "fateclear-solar-time";

trueSolarTime({ year: 1990, month: 3, day: 12, hour: 23, minute: 30, longitude: 116.4 }).trueSolarText;
// "1990-03-12 23:05:50"
solarTerms(2026); // 24 terms with utc and beijing times
```

Options: `longitude` (east positive), `utcOffset` (hours, default 8), `dst` (`"auto"` | `true` | `false`), `eot` (`"precise"` | `"simple"`).

### MCP server

Add the config above to your MCP client. Tools: `true_solar_time`, `solar_terms`, `china_dst`.

### Accuracy

Solar terms are computed with astronomy-engine and agree with tyme4ts within 2 minutes across a 1900–2100 sample. The DST table is verified against the IANA tz database in tests.

### License

MIT. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Companion dataset: [fateclear-calendar-data](https://github.com/a18565517703-ctrl/fateclear-calendar-data).
