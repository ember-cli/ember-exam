/* eslint-env node */
module.exports = {
  'test_page': [
    'tests/index.html?hidepassed&derp=herp',
    'tests/index.html?hidepassed&foo=bar'
  ],
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
