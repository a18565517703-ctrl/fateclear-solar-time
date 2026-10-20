#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { trueSolarTime, solarTerms, solarTerm, CHINA_DST, chinaDstStatus } from "./index.js";

const server = new McpServer({ name: "fateclear-solar-time", version: "0.1.0" });
const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });

server.tool(
  "true_solar_time",
  "Convert a clock birth time at a longitude into local true solar time (longitude correction + equation of time, China 1986–1991 DST aware).",
  {
    datetime: z.string().describe("Clock time 'YYYY-MM-DD HH:mm' or 'YYYY-MM-DDTHH:mm[:ss]'"),
    longitude: z.number().min(-180).max(180).describe("East longitude in degrees, west negative"),
    latitude: z.number().min(-90).max(90).optional(),
    utcOffset: z.number().min(-12).max(14).optional().describe("Clock UTC offset in hours, default 8"),
    dst: z.union([z.literal("auto"), z.boolean()]).optional(),
    eot: z.enum(["precise", "simple"]).optional(),
  },
  async (a) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(a.datetime.trim());
    if (!m) throw new Error("datetime must look like 1990-03-12 23:30");
    const [, y, mo, d, h, mi, s] = m.map(Number);
    return json(trueSolarTime({ year: y, month: mo, day: d, hour: h, minute: mi, second: s || 0, longitude: a.longitude, latitude: a.latitude, utcOffset: a.utcOffset, dst: a.dst, eot: a.eot }));
  },
);

server.tool(
  "solar_terms",
  "List the exact moments (UTC and Beijing time) of the 24 solar terms for a Gregorian year, or one term if name is given.",
  { year: z.number().int().min(1).max(9999), name: z.string().optional().describe("e.g. 立春 / Start of Spring") },
  async ({ year, name }) => json(name ? solarTerm(year, name) : solarTerms(year)),
);

server.tool(
  "china_dst",
  "China daylight saving time 1986–1991: the full table, or the status of one clock time.",
  { datetime: z.string().optional() },
  async ({ datetime }) => {
    if (!datetime) return json(CHINA_DST);
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(datetime.trim());
    if (!m) throw new Error("datetime must look like 1988-06-01 12:00");
    const [, y, mo, d, h, mi] = m.map(Number);
    return json({ datetime, status: chinaDstStatus({ year: y, month: mo, day: d, hour: h, minute: mi }) });
  },
);

await server.connect(new StdioServerTransport());
