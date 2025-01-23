import { processFile } from "./util";

export const processScss = (fileContents: string, convertToHex = false) => {
  // Define the regex pattern
  const regex =
    /$(.*):.*(#[\da-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s\d(.\d)*\));/g;

  return processFile(fileContents, regex, convertToHex);
};
