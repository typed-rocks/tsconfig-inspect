import {describe, expect, it} from 'vitest'
import {inspect, TSConfig} from "./api";
import fs from 'fs';
const tests = [
  {
    input: 'tsconfig.module-node-next.json',
    output: 'tsconfig.module-node-next.result.json',
    withDefaults: true
  },
  {
    input: 'tsconfig.module-node-next-module-detection-set.json',
    output: 'tsconfig.module-node-next-module-detection-set.result.json',
    withDefaults: true
  },
  {
    input: 'tsconfig.strict.json',
    output: 'tsconfig.strict.result.json',
    withDefaults: true
  },
  {
 input: 'tsconfig.extends.json',
 output: 'tsconfig.extends.result.json',
  withDefaults: true
},
  {
    input: 'tsconfig.empty.json',
    output: 'tsconfig.empty.result.json',
    withDefaults: true
  },
  {
    input: 'tsconfig.base-no-defaults.json',
    output: 'tsconfig.base-no-defaults.result.json',
    withDefaults: false
  },
].map(r => ({...r, input: `./testfiles/${r.input}`, output: `./testfiles/${r.output}`}));
const override = false;
describe('Creation', () => {
  tests.forEach(test => {
    it('should create ' + test.input, () => {
      const inputResult: {generated: TSConfig} = inspect({tsConfigPath: test.input, withDefaults: test.withDefaults}) as {generated: TSConfig};
      if(override || !fs.existsSync(test.output)) {
        console.log('Result not exists: ' + test.output);
        fs.writeFileSync(test.output, JSON.stringify(inputResult.generated, null, 2));
      }
      const expected = JSON.parse(fs.readFileSync(test.output, 'utf-8'));
      expect(inputResult.generated).toEqual(expected);
    });
  })

});
