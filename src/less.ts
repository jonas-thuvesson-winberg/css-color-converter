import { cssRegex, lessRegex, processFile } from "./util";

export const processLess = (fileContents: string, convertToHex = false) => {
  // Define the regex pattern
  const regexes = [lessRegex, cssRegex];

  return regexes.reduce((acc, regex) => {
    acc.push(processFile(fileContents, regex, convertToHex));
    return acc;
  }, [] as { variable: string; color: string }[][]).flat();
};
