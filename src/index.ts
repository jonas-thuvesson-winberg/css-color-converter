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

if (argv.length < 3) {
  console.error("Please provide a directory for CSS/LESS/SCSS files");
  exit(1);
}

//const dir = argv[2];
const dir = path.join(cwd(), argv[2]);
const files = fs.readdirSync(dir);
const contents = files
  .filter((f) => f.endsWith(".css"))
  .map((file) => fs.readFileSync(path.join(dir, file), "utf-8"));

let res: { variable: string; color: string }[][] = [];
for (const content of contents) {
  const toHex = argv.includes("--hex");
  res.push(processCss(content, toHex));
}

const outputArg = getArgValue(argv, "--output", ["ts", "json"]);
const output = outputArg.type === "None" ? "ts" : outputArg!.value!.value;

const outputKv = outputKvPair(res);
if (output === "json") {
  fs.writeFileSync("colors.json", kvPairToJsonString(outputKv));
} else {
  fs.writeFileSync("colors.ts", kvPairToTsString(outputKv));
}
