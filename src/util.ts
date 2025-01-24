import fs from "fs";
import path from "path";
import { exit } from "process";
import rgbHex from "rgb-hex";

export const lessRegex = /@(.*):.*(#[\da-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s\d(.\d)*\));/g;

export const scssRegex = /$(.*):.*(#[\da-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s\d(.\d)*\));/g;

export const cssRegex = /--(.*):.*(#[\da-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s\d(.\d)*\));/g;

export const kebabCaseToCamelCase = (str: string): string => {
  return str.replace(/-./g, (x) => x.toUpperCase()[1]);
};

type None = Option<null>;
type Some<T> = Option<T>;

export const getArgValue = (
  args: string[],
  arg: string,
  argShort?: string | null,
  allowedValues?: string[]
): Some<Arg> | None => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === arg || (argShort && args[i] === argShort)) {
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        if (allowedValues && !allowedValues.includes(args[i + 1]))
          return None();
        return Some(new Arg(args[i], args[i + 1]));
      }
      return Some(new Arg(args[i], args[i]));
    }
  }
  return None();
};

export const getFiles = (dir: string, maxDepth: number = 100) => {
  let results: string[] = [];
  if (maxDepth === 0) return results;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath, maxDepth - 1));
    } else {
      if (
        !file.endsWith(".css") &&
        !file.endsWith(".scss") &&
        !file.endsWith(".less")
      )
        continue;
      results.push(filePath);
    }
  }
  return results;
};

export const outputKvPair = (res: { variable: string; color: string }[][]) =>
  res.flat().reduce((acc, { variable, color }) => {
    variable = kebabCaseToCamelCase(variable);
    if (acc[variable]) {
      let counter = 2;
      while (acc[`${variable}_${counter}`]) {
        counter++;
      }
      acc[`${variable}_${counter}`] = color;
      return acc;
    }
    acc[variable] = color;
    return acc;
  }, {} as { [key: string]: string });

export const kvPairToJsonString = (kvPair: { [key: string]: string }) =>
  JSON.stringify(kvPair, null, 4);

export const kvPairToTsString = (kvPair: { [key: string]: string }) =>
  Object.entries(kvPair)
    .map(([key, value]) => `export const ${key} = "${value}";`)
    .join("\n");

export const processFile = (
  fileContents: string,
  regex: RegExp,
  convertToHex = false
) => {
  // Function to extract matches
  function extractCSSVariables(
    str: string
  ): { variable: string; color: string }[] {
    const matches: { variable: string; color: string }[] = [];
    let match;

    while ((match = regex.exec(str)) !== null) {
      let color = match[2].trim();
      if (
        (convertToHex && color.startsWith("rgb")) ||
        (color.startsWith("rgba") && !color.endsWith(")"))
      ) {
        color = `#${rgbHex(color)}`;
      }
      matches.push({
        variable: match[1].trim(),
        color,
      });
    }

    return matches;
  }

  // Run the function and log results
  const extractedVariables = extractCSSVariables(fileContents);
  return extractedVariables;
};

export const validateAndParseArgValue = (
  arg: Some<Arg> | None,
  errorMsg: string
): string => {
  let argParsed: string | null = null;
  if (isNone(arg)) {
    console.error(errorMsg);
    exit(1);
  } else if (isSome(arg)) {
    argParsed = arg.value.value;
  } else {
    console.error("Unknown error"); // Should never happen
    exit(1);
  }
  return argParsed!;
};

export class Arg {
  constructor(public readonly key: string, public readonly value: string) {}
}

export interface Option<T> {
  value: T;
  type: "Some" | "None";
}

export function None(): None {
  return {
    value: null,
    type: "None",
  };
}

export function Some<T>(value: T): Some<T> {
  return {
    value,
    type: "Some",
  };
}

export function isSome<T>(arg: Option<T> | Option<null>): arg is Some<T> {
  return arg.type === "Some";
}

export function isNone<T>(arg: Option<T> | Option<null>): arg is None {
  return arg.type === "None";
}
