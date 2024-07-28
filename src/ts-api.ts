//@ts-nocheck
import {
  computedOptions as computedOptionsNonTyped,
  convertToTSConfig as convertToTSConfigNonTyped,
  optionDeclarations,
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

const defaultCompilerOptions: { [Key in keyof CompilerOptions]: any } = {
  newLine: 'lf',
  forceConsistentCasingInFileNames: true,
  charset: 'utf8',
  importsNotUsedAsValues: 'remove',
  jsxFactory: 'React.createElement',
  jsxFragmentFactory: 'React.Fragment',
  jsxImportSource: 'react',
  moduleDetection: 'auto',
  reactNamespace: 'React',
  // generateCpuProfile: "profile.cpuprofile",
  // tsBuildInfoFile: '.tsbuildinfo',
  pretty: true
}

export function addDefaultCompilerOptions(compilerOptions: CompilerOptions): CompilerOptions {
  return {...defaultCompilerOptions, ...compilerOptions};
}

export function mapEnums(obj: CompilerOptions) {
  Object.entries(obj).forEach(([key, value]) => {
    obj[key] = enumMapping(key, value);
  })
}


const enumMapping = (key: keyof CompilerOptions, value: number | string): string | number => {
  const typeMap = optionDeclarations.find(e => e.name === key)?.type;
  if (typeMap instanceof Map) {
    const typeArray = Array.from(typeMap.entries());
    const found = typeArray.find(([key, enumVal]) => value === enumVal);
    if (found) {
      return found[0];
    }
  }
  return value;
}
