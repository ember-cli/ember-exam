import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ember-exam",
  description: "Run your tests with randomization, splitting, and parallelization for beautiful tests.",
  base: '/ember-exam/',
  markdown: {
    // theme: {
    //   ...dark,
    //   settings: [
    //     {
    //       scope: 'comment',
    //       settings: {
    //         // 'foreground': 'rgb(200, 200, 200)'
    //       }
    //     },
    //   ]
    // },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Options',
        items: [
          { text: 'Randomization', link: '/randomization' },
          { text: 'Randomization Iterator', link: '/randomization-iterator' },
          { text: 'Generating Module Metadata For Test Execution', link: '/module-metadata' },
          { text: 'Splitting', link: '/splitting' },
          { text: 'Split Test Parallelization', link: '/split-parallel' },
          { text: 'Filtering', link: '/filtering' },
          { text: 'Test Load Balancing', link: '/load-balancing' },
        ]
      },
      {
        text: 'Advanced Configuration',
        items: [
          { text: 'Ember Try & CI Integration', link: '/ember-try-and-ci' },
          { text: 'Test Suite Segmentation', link: '/test-suite-segmentation' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ember-cli/ember-exam' }
    ]
  }
})
