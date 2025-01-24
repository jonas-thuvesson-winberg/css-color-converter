import path from "node:path";
import { processCss } from "./css";
import { argv, exit, cwd } from "node:process";
import fs from "node:fs";
import {
  getArgValue,
  getFiles,
  isSome,
  kvPairToJsonString,
  kvPairToTsString,
  outputKvPair,
  validateAndParseArgValue,
} from "./util";
import { processScss } from "./sass";
import { processLess } from "./less";

const outputDirArg = getArgValue(argv, "--output-dir", "-od");
const outputDir = validateAndParseArgValue(
  outputDirArg,
  "Please provide an output directory"
);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const dirArg = getArgValue(argv, "--dir", "-d");
const dir = validateAndParseArgValue(
  dirArg,
  "Please provide a directory for CSS/LESS/SCSS files"
);

const outputTypeArg = getArgValue(argv, "--output-format", "-of", [
  "json",
  "ts",
]);
let outputType = isSome(outputTypeArg) ? outputTypeArg.value.value : "ts";

const outfileNameArg = getArgValue(argv, "--output-file-name", "-ofn");
let outputFile = isSome(outfileNameArg) ? outfileNameArg.value.value : "colors";

const files = getFiles(dir);

console.log("Files found:");
for (const file of files) {
  console.log(file);
}

const contents = files.map((file) => [file, fs.readFileSync(file, "utf-8")]);

let res: { variable: string; color: string }[][] = [];
const toHex = argv.includes("--hex");
for (const [file, content] of contents) {
  if (file.endsWith(".css")) res.push(processCss(content, toHex));
  else if (file.endsWith(".scss")) res.push(processScss(content, toHex));
  else if (file.endsWith(".less")) res.push(processLess(content, toHex));
  res.push(processCss(content, toHex));
}

const outputKv = outputKvPair(res);
if (outputType === "json") {
  fs.writeFileSync(
    path.join(outputDir, `${outputFile}.json`),
    kvPairToJsonString(outputKv)
  );
  console.log(
    `Output written to ${path.join(outputDir, `${outputFile}.json`)}`
  );
} else {
  fs.writeFileSync(
    path.join(outputDir, `${outputFile}.ts`),
    kvPairToTsString(outputKv)
  );
  console.log(`Output written to ${path.join(outputDir, `${outputFile}.ts`)}`);
}
