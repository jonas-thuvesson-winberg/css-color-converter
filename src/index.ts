import path from "node:path";
import { processCss } from "./css";
import { argv, exit, cwd } from "node:process";
import fs from "node:fs";
import {
  getArgValue,
  kvPairToJsonString,
  kvPairToTsString,
  outputKvPair,
} from "./util";

if (argv.length < 4) {
  console.error("Please provide an output directory and a directory for CSS/LESS/SCSS files");
  exit(1);
}

//const dir = argv[2];
const outputDir = argv[2];
const dir = argv[3];
const files = fs.readdirSync(dir);
const contents = files
  .filter((f) => f.endsWith(".css"))
  .map((file) => fs.readFileSync(path.join(dir, file), "utf-8"));

let res: { variable: string; color: string }[][] = [];
for (const content of contents) {
  const toHex = argv.includes("--hex");
  res.push(processCss(content, toHex));
}

const output = argv.includes("--json") ? "json" : "ts";

const outputKv = outputKvPair(res);
if (output === "json") {
  fs.writeFileSync(path.join(outputDir, "colors.json"), kvPairToJsonString(outputKv));
} else {
  fs.writeFileSync(path.join(outputDir, "colors.ts"), kvPairToTsString(outputKv));
}
