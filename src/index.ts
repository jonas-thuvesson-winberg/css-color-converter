import path from "node:path";
import { processCss } from "./css";
import { argv, exit, cwd } from "node:process";
import fs from "node:fs";
import {
  getArgValue,
  isNone,
  isSome,
  kvPairToJsonString,
  kvPairToTsString,
  outputKvPair,
  Some,
} from "./util";

if (argv.length < 4) {
  console.error(
    "Please provide an output directory and a directory for CSS/LESS/SCSS files"
  );
  exit(1);
}

//const dir = argv[2];
const outputDirArg = getArgValue(argv, "--output-dir", "-od");
if (isNone(outputDirArg)) {
  console.error("Please provide an output directory");
  exit(1);
}

const outputDir = outputDirArg.value!.value!;
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Directory created successfully.');
} else {
  console.log('Directory already exists.');
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

const files = fs.readdirSync(dir);
const contents = files
  .filter((f) => f.endsWith(".css"))
  .map((file) => fs.readFileSync(path.join(dir, file), "utf-8"));

let res: { variable: string; color: string }[][] = [];
for (const content of contents) {
  const toHex = argv.includes("--hex");
  res.push(processCss(content, toHex));
}

const outputKv = outputKvPair(res);
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
