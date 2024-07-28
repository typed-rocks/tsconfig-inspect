import ts, {
  CompilerOptions,
  CompilerOptionsValue,
  DiagnosticCategory,
  getParsedCommandLineOfConfigFile,
  parseJsonConfigFileContent,
  ProjectReference,
  readConfigFile,
  sys
} from 'typescript';
import {addDefaultCompilerOptions, computedOptions, convertToTSConfig, mapEnums} from "./ts-api";
import {clearUndefined} from "./util";
import path from 'path';

export interface TSConfig {
  compilerOptions: CompilerOptions;
  compileOnSave: boolean | undefined;
  exclude?: readonly string[];
  files: readonly string[] | undefined;
  include?: readonly string[];
  references: readonly ProjectReference[] | undefined;
}

export function inspect(config: { tsConfigPath: string, withDefaults: boolean }): {
  tsConfig?: {
    generated: TSConfig,
    realCompilerConfig: CompilerOptions
  },
  diagonstics?: ts.Diagnostic
} {
  const output = readConfigFile(config.tsConfigPath, sys.readFile);
  if (output.error?.category === DiagnosticCategory.Error) {
    return {diagonstics: output.error};
  }
  const configFile = output.config;
  const dir = path.dirname(config.tsConfigPath);
  const whatIsInTsConfig = parseJsonConfigFileContent(configFile, sys, dir);

  const compilerOptionsInTsConfig = {...whatIsInTsConfig.options};

  const parseResult = getParsedCommandLineOfConfigFile(config.tsConfigPath, undefined, ts.sys as any);
  if (!parseResult) {
    return {
      diagonstics: {
        messageText: 'An error happened',
        category: DiagnosticCategory.Error,
        file: undefined,
        code: 1,
        start: undefined,
        length: undefined
      }
    }
  }
  const tsConfigRootProperties = convertToTSConfig(parseResult, config.tsConfigPath, sys);
  const providedKeys = new Set(Object.keys(compilerOptionsInTsConfig));
  const withAndWithoutDefaults: {
    withDefaults: Record<string, CompilerOptionsValue>,
    withoutDefaults: Record<string, CompilerOptionsValue>,
  } = {withDefaults: {}, withoutDefaults: {}};
  type KeyComputedOptions = keyof typeof computedOptions;
  for (const option in computedOptions) {
    if (!providedKeys.has(option)) {
      const optionKey = option as KeyComputedOptions;
      const implied = computedOptions[optionKey].computeValue(compilerOptionsInTsConfig);
      const defaultValue = computedOptions[optionKey].computeValue({} as CompilerOptions);
      withAndWithoutDefaults.withDefaults[option] = implied;
      if (implied !== defaultValue) {
        withAndWithoutDefaults.withoutDefaults[option] = implied;
      }
    }
  }
  const implied = config.withDefaults ? withAndWithoutDefaults.withDefaults : withAndWithoutDefaults.withoutDefaults;
  let compilerOptions: CompilerOptions = {...compilerOptionsInTsConfig, ...implied};
  if (config.withDefaults) {
    compilerOptions = addDefaultCompilerOptions(compilerOptions);
  }


  clearUndefined(compilerOptions);
  mapEnums(compilerOptions);
  const resultingTsConfig = {...tsConfigRootProperties, compilerOptions: compilerOptions};
  clearUndefined(resultingTsConfig);
  return {tsConfig: {generated: resultingTsConfig, realCompilerConfig: compilerOptionsInTsConfig}};
}
