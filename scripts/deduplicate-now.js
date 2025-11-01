#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Делаем .cjs-копию, чтобы обойти "type: module" и require()
const src = path.join(__dirname, "deduplicate-events.js");
const cjs = path.join(__dirname, "deduplicate-events.cjs");
if (!existsSync(cjs)) writeFileSync(cjs, readFileSync(src));

// Запускаем CJS-скрипт
const r = spawnSync(process.execPath, [cjs], { stdio: "inherit" });
process.exit(r.status ?? 0);