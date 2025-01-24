import path from "node:path";
import { processCss } from "./css";
import { argv, exit, cwd } from "node:process";
import fs from "node:fs";
import {
  getArgValue,
  getFiles,
  isNone,
  isSome,
  kvPairToJsonString,
  kvPairToTsString,
  outputKvPair,
  Some,
} from "./util";
import { processScss } from "./sass";
import { processLess } from "./less";


const outputDirArg = getArgValue(argv, "--output-dir", "-od");
if (isNone(outputDirArg)) {
  console.error("Please provide an output directory");
  exit(1);
}

const outputDir = outputDirArg.value!.value!;
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} 

const dirArg = getArgValue(argv, "--dir", "-d");
if (isNone(dirArg)) {
  console.error("Please provide a directory for CSS/LESS/SCSS files");
  exit(1);
}

const dir = dirArg.value!.value!;

const outputTypeArg = getArgValue(argv, "--output-format", "-of", [
  "json",
  "ts",
]);
let outputType = "ts";
if (isSome(outputTypeArg)) {
  outputType = outputTypeArg.value.value!;
}

const outfileNameArg = getArgValue(argv, "--output-file-name", "-ofn");
let outputFile = "colors";
if (isSome(outfileNameArg)) {
  outputFile = outfileNameArg.value.value;
}

const files = getFiles(dir);
const contents = files
  // .filter((f) => f.endsWith(".css"))
  .map((file) => [file, fs.readFileSync(file, "utf-8")]);

let res: { variable: string; color: string }[][] = [];
const toHex = argv.includes("--hex");
for (const [file, content] of contents) {
  if (file.endsWith(".css")) res.push(processCss(content, toHex));
  else if (file.endsWith(".scss")) res.push(processScss(content, toHex));
  else if (file.endsWith(".less")) res.push(processLess(content, toHex));
  res.push(processCss(content, toHex));
}

const outputKv = outputKvPair(res);
console.log(outputKv);
if (outputType === "json") {
  fs.writeFileSync(
    path.join(outputDir, `${outputFile}.json`),
    kvPairToJsonString(outputKv)
  );
} else {
  fs.writeFileSync(
    path.join(outputDir, `${outputFile}.ts`),
    kvPairToTsString(outputKv)
  );
}
