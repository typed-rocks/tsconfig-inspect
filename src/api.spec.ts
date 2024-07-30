import { describe, expect, it } from "vitest";
import { CliArgs, inspect, TSConfig } from "./api";
import fs from "fs";
import path from "path";

const tests: ({ output: string } & CliArgs)[] = [
  {
    tsConfigPath: "tsconfig.module-node-next.json",
    withDefaults: true,
  },
  {
    tsConfigPath: "tsconfig.module-node-next-module-detection-set.json",
    withDefaults: true,
  },
  { tsConfigPath: "tsconfig.strict.json", withDefaults: true },
  {
    tsConfigPath: "tsconfig.extends.json",
    withDefaults: true,
  },
  {
    tsConfigPath: "tsconfig.empty.json",
    withDefaults: true,
  },
  {
    tsConfigPath: "tsconfig.base-no-defaults.json",
    withDefaults: false,
  },
  {
    tsConfigPath: "tsconfig.files-excluded.json",
    withDefaults: false,
    showFiles: true,
  },
  {
    tsConfigPath: "tsconfig.files-excluded.json",
    withDefaults: false,
    showFiles: false,
  },
  {
    tsConfigPath: "tsconfig.path.json",
    withDefaults: true,
    showFiles: true,
  },
].map((r) => {
  const tsConfigPath = r.tsConfigPath;
  r.tsConfigPath = `./testfiles/${tsConfigPath}`;
  const fileName = path.basename(tsConfigPath);
  const prefix = fileName.substring(0, fileName.length - 5);
  const output = `${prefix}-${r.withDefaults}-${r.showFiles}.json`;
  return { ...r, output: `./testfiles/${output}` };
});
const override = false;
describe("Creation", () => {
  tests.forEach((test) => {
    it("should create " + test.tsConfigPath, () => {
      const inputResult: { generated: TSConfig } = inspect(test) as {
        generated: TSConfig;
      };
      if (override || !fs.existsSync(test.output)) {
        console.log("Result not exists: " + test.output);
        fs.writeFileSync(
          test.output,
          JSON.stringify(inputResult.generated, null, 2),
        );
      }
      const expected = JSON.parse(fs.readFileSync(test.output, "utf-8"));
      expect(inputResult.generated).toEqual(expected);
    });
  });
});
