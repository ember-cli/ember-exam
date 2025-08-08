/**
 * This file is used by CI to list all the test files we have to generate a matrix to run.
 * Since our node-tests dirty the working directory, we don't want to have different test files stepping on each other.
 *
 * Additionally, this allows us to run each test file in parallel with the other test files.
 *
 * The code here was copied from https://github.com/embroider-build/try/blob/main/cli.js
 * (ish)
 */
import assert from "node:assert";
// We run this file on node 24
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { glob } from "node:fs/promises";

let files = [
  {
    name: "Unit",
    command: "pnpm mocha 'node-tests/unit/**/*-test.js'",
  },
];

for await (const entry of glob(
  "node-tests/acceptance/**/*-test.{js,ts,mjs,cjs,mts,cts}",
)) {
  let name = entry.replace("node-tests/acceptance/", "");
  files.push({
    name,
    include: {
      name,
      command: `pnpm mocha ${entry}`,
    },
  });
}

assert(
  files.length > 0,
  `There were no found test files -- this is unexpected`,
);

process.stdout.write(
  JSON.stringify({
    name: files.map((s) => s.name),
    // always include an empty env by default, so that it's convenient to pass
    // `${{ matrix.env }}` in github actions
    include: files.map((s) => ({ env: {}, ...s.include })),
  }),
);
