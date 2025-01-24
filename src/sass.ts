import { cssRegex, processFile, scssRegex } from "./util";

export const processScss = (fileContents: string, convertToHex = false) => {
  // Define the regex pattern
  const regexes = [scssRegex, cssRegex];

  return regexes.reduce((acc, regex) => {
    acc.push(processFile(fileContents, regex, convertToHex));
    return acc;
  }, [] as { variable: string; color: string }[][]).flat();
};
