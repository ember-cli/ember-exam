import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        /**
         * This is super try-hard mode, but since we're debugging
         * with built assets, we want to have smaller chunks for easier debugging without sourcemaps.
         */
        // manualChunks(id) {
        //   let maybePkg = guessPkgName(id);
        //
        //   return maybePkg;
        // },
      },
    },
  },
});

// eslint-disable-next-line no-unused-vars
function guessPkgName(id) {
  if (!id.includes('/')) {
    return id;
  }

  let parts = id.split('/node_modules/');

  let significant = parts.at(-1);

  {
    let parts = significant.split('.pnpm/');

    significant = parts.at(-1);
  }

  {
    let parts = significant.split('/');

    if (parts[0] !== id) return parts[0].replace('@', '');
  }

  if (id.includes('/-embroider')) {
    return 'embroider';
  }

  return guessPkgName(id);
}
