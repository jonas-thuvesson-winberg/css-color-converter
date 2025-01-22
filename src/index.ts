import path from "node:path";
import { processCss } from "./css.js";
import { argv, exit, cwd } from "node:process";
import fs from "node:fs";

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
  const toHex =
    (argv.length > 3 && argv[3] === "--hex") ||
    (argv.length > 4 && argv[4] === "--hex")
      ? true
      : false;
  res.push(processCss(content, toHex));
}

const outputJson = JSON.stringify(
  res.flat().reduce((acc, { variable, color }) => {
    acc[variable] = color;
    return acc;
  }, {} as { [key: string]: string })
);

const output =
  (argv.length > 3 && argv[3] === "--json") ||
  (argv.length > 4 && argv[4] === "--json")
    ? "json"
    : "ts";

if (output === "json") {
  fs.writeFileSync("colors.json", outputJson);
} else {
    fs.writeFileSync("colors.ts", `export const colors = ${outputJson};`);
}
