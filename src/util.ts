export const kebabCaseToCamelCase = (str: string): string => {
  return str.replace(/-./g, (x) => x.toUpperCase()[1]);
};

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

export const outputKvPair = (res: { variable: string; color: string }[][]) =>
  res.flat().reduce((acc, { variable, color }) => {
    acc[variable] = color;
    return acc;
  }, {} as { [key: string]: string });

export const kvPairToJsonString = (kvPair: { [key: string]: string }) =>
  JSON.stringify(kvPair, null, 4);

export const kvPairToTsString = (kvPair: { [key: string]: string }) =>
  Object.entries(kvPair)
    .map(
      ([key, value]) =>
        `export const ${kebabCaseToCamelCase(key)} = "${value}";`
    )
    .join("\n");

export class Arg {
  constructor(public readonly key: string, public readonly value: string) {}
}

export interface Option<T> {
  value: T;
  type: "Some" | "None";
}

export interface Some<T> extends Option<T> {
  type: "Some";
}

export interface None extends Option<null> {
  type: "None";
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
