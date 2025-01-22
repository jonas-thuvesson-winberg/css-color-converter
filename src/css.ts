import rgbHex from "rgb-hex";

export const processCss = (fileContents: string, convertToHex = false) => {
  // Define the regex pattern
  const regex =
    /--(.*):.*(#[\da-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s\d(.\d)*\));/g;

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
        console.log("hex");
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
