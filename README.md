[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

# fateclear-solar-time

**把钟表时间与经度换算成当地真太阳时，并查看每一步修正。**

面向历法应用、时间换算工具和 AI 助手的小型 TypeScript 库。输入日期、钟表时间、经度与时区偏移，获得真太阳时、经度修正、均时差和夏令时状态；也可以查询二十四节气时刻。附带 MCP 服务。

[![CI](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

由 [拨云 FateClear](https://fateclear.com) 维护 · [在线排盘入口](https://fateclear.com/bazi) · [X 项目更新](https://x.com/liu_xiaoyu27334)

## 先看输入与结果

安装后，在支持 ESM 的 TypeScript 项目中调用：

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

默认标准时区偏移为 UTC+8。东经 116.4° 相对该时区的经度修正为 `116.4 × 4 − 8 × 60 = −14.4` 分钟，再叠加当天的均时差，得到当地真太阳时。结果同时保留分项修正，便于应用说明换算过程。

示例沿用仓库已有的公开日期，用于说明 API。完整返回类型见 [src/solar-time.ts](src/solar-time.ts)。

## 最短接入方式

需要 Git、Node.js 18 或更新版本、npm，以及支持 ESM 的项目。

```sh
npm install github:xiaoyu312/fateclear-solar-time
```

这里使用 GitHub 源码安装方式；安装过程会通过 `prepare` 编译 TypeScript，需要能够安装声明的依赖。已发布 [v0.1.0](https://github.com/xiaoyu312/fateclear-solar-time/releases/tag/v0.1.0)，该版本没有额外下载附件。只想体验生日排盘与真太阳时展示，可直接打开 [FateClear](https://fateclear.com/bazi)。

## 核心能力

| 入口 | 输入与结果 |
| --- | --- |
| `trueSolarTime` | 钟表日期时间、经度和选项 → 当地真太阳时、平太阳时、UTC、各项分钟修正和 DST 状态 |
| `solarTerms` / `solarTerm` | 公历年，或年份与节气名 → 二十四节气时刻；名称支持简体、繁体和英文 |
| `chinaDstStatus` / `CHINA_DST` | 中国钟表时间 → 夏令时状态；或读取 1986–1991 年的六年起止表 |
| MCP 服务 | 通过 stdio 向兼容客户端提供以上换算和查询能力 |

## 库的用法与参数

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

`trueSolarTime` 参数：

| 参数 | 说明 |
| --- | --- |
| `year` / `month` / `day` / `hour` / `minute` | 钟表记录的公历日期和时间；月份为 1–12 |
| `second` | 可选，默认 0 |
| `longitude` | 必填，经度范围 −180 到 180；东经为正，西经为负 |
| `latitude` | 可选，为记录保留，不参与计算 |
| `utcOffset` | 标准时区相对 UTC 的小时偏移，默认 8；夏令时另由 `dst` 处理 |
| `dst` | `"auto"`（默认，UTC+8 时采用中国 1986–1991 年规则）、`true`（强制减 1 小时）、`false`（不做夏令时修正） |
| `eot` | `"precise"`（默认，按天文位置计算均时差）或 `"simple"`（三项近似公式） |

结果中的 `trueSolar` 是日期时间字段；`trueSolarText`、`meanSolarText` 是格式化时间，`utc` 是对应的 UTC 时刻。`dstStatus` 标记夏令时状态；`dstCorrectionMinutes`、`longitudeCorrectionMinutes`、`equationOfTimeMinutes`、`totalCorrectionMinutes` 给出各项修正与总修正。

`dstStatus` 由 `utcOffset` 与内置规则判定，不随 `dst` 的手动开关变化。即使关闭夏令时修正，也可能返回 `dst` 状态；实际应用的修正应查看 `dstCorrectionMinutes`。

节气结果包含 `index`、`zh`、`zhHant`、`en`、`longitude`、`utc` 和 `beijing`。每年从小寒开始，`index` 为 0–23；`beijing` 始终为固定 UTC+8，不含夏令时。

## 让 AI 助手通过 MCP 调用

将以下配置加入支持 stdio 的 MCP 客户端。客户端需要能找到 Git、Node.js 和 `npx`；首次启动可能需要获取 GitHub 源码、下载依赖并编译。

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

| 工具 | 用途 |
| --- | --- |
| `true_solar_time` | 提供 `datetime`、`longitude` 及可选参数，换算真太阳时 |
| `solar_terms` | 提供 `year`，可选 `name`，查询全年或单个节气 |
| `china_dst` | 不传参数时返回六年表；提供 `datetime` 时返回状态 |

`datetime` 使用 `YYYY-MM-DD HH:mm`；`true_solar_time` 也接受 `T` 分隔和可选秒。各客户端的配置文件位置不同，参数定义见 [src/mcp.ts](src/mcp.ts)。

## 使用边界与验证范围

- 本库做时间换算和历法查询，不生成完整八字排盘，也不作命理判断。
- 自动夏令时仅内置中国 1986–1991 年规则，并在 `utcOffset` 为 8 时采用；它不是全球历史时区数据库，也不会根据经度识别国家。其他地区应自行确定标准偏移与夏令时处理。
- 夏令时状态包括 `standard`、`dst`、`nonexistent`（拨快跳过的时间）和 `ambiguous`（拨回重复的时间）。自动模式对 `dst` 和 `nonexistent` 减 1 小时，对 `ambiguous` 不减。状态标记不等于消除了歧义，临界时间需由调用者确认。
- 节气按 astronomy-engine 的太阳视黄经计算。时间格式到秒，不代表绝对误差小于 1 秒；源码测试以 1900–2100 年每 7 年抽样，与 tyme4ts 比较，阈值为 2 分钟，不能外推为所有年份的保证。
- `simple` 均时差是近似值；已有测试对 2000 年每 7 天抽样，与 `precise` 比较，阈值为 2 分钟。这不是所有日期的误差承诺。
- 夏令时测试使用 IANA `Asia/Shanghai` 规则检查各年切换边界。测试定义与 CI 配置可在仓库查看；本次文档整理未重新安装、构建、执行测试或启动 MCP，也未验收在线页面。

已有仓库副本时，可在仓库根目录执行以下开发检查。CI 配置列出 Node.js 18、20、22；此列表不表示本轮已重新验证各环境。

```sh
npm ci
npm run typecheck
npm test
npm run build
```

## 文档与来源

- [API 导出](src/index.ts) · [太阳时实现](src/solar-time.ts) · [节气实现](src/solar-terms.ts) · [夏令时表](src/dst.ts)
- [测试覆盖](test/solar.test.ts) · [命令和依赖](package.json) · [CI 配置](.github/workflows/ci.yml)
- [配套历法数据](https://github.com/xiaoyu312/fateclear-calendar-data)：1900–2100 年节气、干支、农历，提供 CSV / JSON；数据采用独立的 CC BY 4.0 许可。

## 许可与作者

本库采用 [MIT](LICENSE)。天文算法、MCP SDK、构建及测试依赖的来源与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；中国夏令时表来源说明也列于其中。

欢迎体验 [FateClear](https://fateclear.com) 的生日排盘与解读，或在 [X](https://x.com/liu_xiaoyu27334) 关注后续项目更新。
