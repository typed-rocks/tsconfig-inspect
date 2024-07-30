#!/usr/bin/env node

import { CliArgs, inspect, TSConfig } from "./api";
import path from "path";
import fs from "fs";
import chalk from "chalk";

import { Command } from "commander";
import { CompilerOptions, Diagnostic } from "typescript";

const program = new Command();

program
  .version("1.0.1")
  .description("tsconfig-inspect")
  .option(
    "--path <value>",
    "The path to the tsconfig file to inspect",
    "./tsconfig.json",
  )
  .option(
    "--defaults <value>",
    "enable or disable showing not changed defaults (true/false)",
    true,
  )
  .option(
    "--showFiles <value>",
    "enable or disable showing to resolve included files (true/false)",
    true,
  )
  .option("--noColor", "when set disable the colors", false)
  .addHelpText(
    "afterAll",
    `
    
What are the colors in the output? 
- blue: Non-default values which were impacted by the provided configuration.
- green: Default values which were not impacted by the provided configuration.
- white: Your inputs from the tsconfig file.`,
  )
  .parse(process.argv);

const options = program.opts();

function loadArgs(): CliArgs | undefined {
  const tsConfigPath = options.path;
  const absolute = path.resolve(tsConfigPath);
  if (!fs.existsSync(absolute)) {
    console.error(`tsconfig file at ${absolute} does not exist.`);
    return undefined;
  }
  const withDefaults =
    options["defaults"] !== true ? options["defaults"] === "true" : true;
  const showFiles =
    options["showFiles"] !== true ? options["showFiles"] === "true" : true;
  const showColor = !options["noColor"];
  return {
    tsConfigPath: path.resolve(tsConfigPath),
    withDefaults: withDefaults,
    showFiles: showFiles,
    showColor,
  };
}

function isDiagnostics(
  input: ReturnType<typeof inspect>,
): input is { diagnostics: Diagnostic } {
  return !!(input as { diagnostics: Diagnostic }).diagnostics;
}

const config = loadArgs();
if (!config) {
  process.exit(1);
}
const result = inspect(config);
if (isDiagnostics(result)) {
  console.error(result.diagnostics.messageText);
  process.exit(1);
}

const { generated, realCompilerConfig, onlyGenerated } = result as {
  generated: TSConfig;
  realCompilerConfig: CompilerOptions;
  onlyGenerated: CompilerOptions;
};
const keys: (keyof CompilerOptions)[] = Object.keys(realCompilerConfig);
const allKeys = Object.keys(generated.compilerOptions);
const newKeys = allKeys.filter((k) => !keys.includes(k));
const generatedKeys = Object.keys(onlyGenerated);
const generatedStringedLine = JSON.stringify(generated, null, 2).split("\n");

const output = generatedStringedLine
  .map((line) => {
    const isNewKey = newKeys.some((newKey) =>
      line.trim().startsWith(`"${newKey}":`),
    );
    const isGenerated = generatedKeys.some((newKey) =>
      line.trim().startsWith(`"${newKey}":`),
    );
    if (config.showColor) {
      if (isGenerated) {
        return chalk.blue(line);
      }
      if (isNewKey) {
        return chalk.green(line);
      }
    }
    return line;
  })
  .join("\n");
console.log(output);
