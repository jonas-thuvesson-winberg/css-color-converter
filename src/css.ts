import { cssRegex, processFile } from "./util";

export const processCss = (fileContents: string, convertToHex = false) => {
  // Define the regex pattern
  const regex = cssRegex;

  return processFile(fileContents, regex, convertToHex);
};
