import globals from "globals";
import { ember } from "ember-eslint";
import * as url from "url";

// Needed until Node 20
const dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default [
  ...ember.recommended(dirname),
  {
    name: "monorepo-root:ignores",
    ignores: ["test-apps/**/*", "acceptance-dist/**/*", "failure-dist/**/*"],
  },
  {
    name: "monorepo-root:lib",
    files: ["lib/**/*"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: "monorepo-root:node-tests",
    files: ["node-tests/**/*"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      "ember/no-test-support-import": "off",
    },
  },
];
