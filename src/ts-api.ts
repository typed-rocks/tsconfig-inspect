//@ts-nocheck
import {
  computedOptions as computedOptionsNonTyped,
  convertToTSConfig as convertToTSConfigNonTyped,
  optionDeclarations as optionDeclarationsNonTyped,
} from 'typescript/lib/typescript.js';
import {CompilerOptions, ParsedCommandLine} from "typescript";
import {TSConfig} from "./api";

export type StrictOptionName =
  | "noImplicitAny"
  | "noImplicitThis"
  | "strictNullChecks"
  | "strictFunctionTypes"
  | "strictBindCallApply"
  | "strictPropertyInitialization"
  | "alwaysStrict"
  | "useUnknownInCatchVariables";

type CompilerOptionKeys = keyof { [K in keyof CompilerOptions as string extends K ? never : K]: any; };
export const optionDeclarations: any[] = optionDeclarationsNonTyped;
declare function convert(configParseResult: ParsedCommandLine, configFileName: string, host: any): TSConfig;

export const computedOptions = createComputedCompilerOptions(computedOptionsNonTyped);


export const convertToTSConfig: typeof convert = convertToTSConfigNonTyped;

function createComputedCompilerOptions<T extends Record<string, CompilerOptionKeys[]>>(
  options: {
    [K in keyof T & CompilerOptionKeys | StrictOptionName]: {
      dependencies: T[K];
      computeValue: (compilerOptions: Pick<CompilerOptions, K | T[K][number]>) => Exclude<CompilerOptions[K], undefined>;
    };
  },
) {
  return options;
}



