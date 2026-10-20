# Third-party notices / 第三方声明

This package bundles no third-party source code. It depends on the packages below at runtime or for tests.
本包没有复制第三方源码，只在运行或测试时依赖下列软件包。

| Package | Use | License | Source |
|---|---|---|---|
| astronomy-engine 2.x | Sun position, sidereal time, solar-longitude search (runtime) | MIT, © Don Cross | https://github.com/cosinekitty/astronomy |
| @modelcontextprotocol/sdk 1.x | MCP stdio server (runtime) | MIT | https://github.com/modelcontextprotocol/typescript-sdk |
| zod 3.x | MCP input schemas (runtime) | MIT, © Colin McDonnell | https://github.com/colinhacks/zod |
| tyme4ts 1.x | Cross-check of solar-term moments in tests only (dev) | MIT, © 6tail | https://github.com/6tail/tyme4ts |
| lunar-javascript 1.x | Cross-check in tests only (dev) | MIT, © 6tail | https://github.com/6tail/lunar-javascript |
| vitest, typescript | Build and test tooling (dev) | MIT / Apache-2.0 | npm |

The China 1986–1991 DST table matches the IANA tz database (Asia/Shanghai, public domain) and is checked against it in the tests.
中国 1986–1991 年夏令时表与 IANA 时区数据库（Asia/Shanghai，公有领域）一致，测试里逐条核对。

The "simple" equation-of-time option uses a widely published three-term approximation.
