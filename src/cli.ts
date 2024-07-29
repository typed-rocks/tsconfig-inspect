#!/usr/bin/env node

import {inspect, TSConfig} from "./api";
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

import {Command} from "commander";
import {CompilerOptions, Diagnostic} from "typescript";

const program = new Command();

program
  .version("1.0.0")
  .description("tsconfig-inspect")
  .option("--path <value>", "The path to the tsconfig file to inspect", './tsconfig.json')
  .option("--defaults <value>", "enable or disable defaults with true or false", true)
  .parse(process.argv);

const options = program.opts();

type Args = { tsConfigPath: string, withDefaults: boolean };

function loadArgs(): Args | undefined {
  const tsConfigPath = options.path;
  const absolute = path.resolve(tsConfigPath);
  if(!fs.existsSync(absolute)) {
    console.error(`tsconfig file at ${absolute} does not exist.`);
    return undefined;
  }
  const withDefaults = options['defaults'] !== true ? options['defaults'] === 'true' : true;

  return {tsConfigPath: path.resolve(tsConfigPath), withDefaults: withDefaults};
}

function isDiagnostics(input: ReturnType<typeof inspect>): input is {diagnostics: Diagnostic} {
  return !!(input as {diagnostics: Diagnostic}).diagnostics;
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

 const {generated, realCompilerConfig} = result as {
   generated: TSConfig,
   realCompilerConfig: CompilerOptions
 };
  const keys: (keyof CompilerOptions)[] = Object.keys(realCompilerConfig);


  const generatedStringedLine = JSON.stringify(generated, null, 2).split('\n');

  let inCompilerOptions = false;
  const output = generatedStringedLine.map(line => {
    if (line.trim().startsWith('}') && inCompilerOptions) {
      inCompilerOptions = false;
    }
    //console.log({line, inCompilerOptions, res: !keys.some(key => line.includes(key))});
    if (inCompilerOptions && !keys.some(key => line.trim().startsWith(`"${key}"`))) {
      return chalk.green(line);
    }
    if (line.includes('compilerOptions')) {
      inCompilerOptions = true;
    }
    return line;
  }).join('\n');
  console.log(output);



