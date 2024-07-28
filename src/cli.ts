#!/usr/bin/env node

import {inspect} from "./api";
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

import {Command} from "commander";

const program = new Command();

program
  .version("1.0.0")
  .description("tsconfig-inspect")
  .option("--path <value>", "The path to the tsconfig file to inspect", './tsconfig.json')
  .option("--defaults", "If specified, no defaults will be generated", true)
  .parse(process.argv);

const options = program.opts();

type Args = { tsConfigPath: string, withDefaults: boolean };

function loadArgs(): Args | undefined {
  const tsConfigPath = options.path ?? './tsconfig.json';
  const absolute = path.resolve(tsConfigPath);
  if(!fs.existsSync(absolute)) {
    console.error(`tsconfig file at ${absolute} does not exist.`);
    return undefined;
  }
  const withDefaults = options['defaults'];
  const obj: Args = {tsConfigPath, withDefaults};

  return {tsConfigPath: path.resolve(obj.tsConfigPath), withDefaults: obj.withDefaults};
}


const config = loadArgs();
if (!config) {
  process.exit(1);
}
const result = inspect(config);
if (result.tsConfig) {
  const {realCompilerConfig, generated} = result.tsConfig;
  const keys = Object.keys(realCompilerConfig);
  const generatedStringedLine = JSON.stringify(generated, null, 2).split('\n');
  let inCompilerOptions = false;
  const output = generatedStringedLine.map(line => {

    if(line.trim().startsWith('}') && inCompilerOptions) {
      inCompilerOptions = false;
    }
    if(inCompilerOptions && !keys.some(key => line.includes(key))) {
      return chalk.green(line);
    }
    if(line.includes('compilerOptions')) {
      inCompilerOptions = true;
    }
    return line;
  }).join('\n');
  console.log(output);
} else {
  console.error(result.diagonstics?.messageText);
}


