/* eslint-env node */
module.exports = {
  'disable_watching': true,
  'launch_in_ci': [
    'PhantomJS'
  ],
  'launch_in_dev': [
    'PhantomJS',
    'Chrome'
  ],
  'parallel': -1
};
