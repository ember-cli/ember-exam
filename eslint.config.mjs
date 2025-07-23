import globals from "globals";
import { ember } from "ember-eslint";
import * as url from "url";

// Needed until Node 20
const dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default [
  ...ember.recommended(dirname),
  {
    files: ["lib/**/*"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
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
