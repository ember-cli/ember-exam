// Extract the query parameters into a dictionary
var query = window.location.search.substring(1);
var params = query.split('&');
var dict = params.reduce(function(dict, param) {
  var parts = param.split('=');
  dict[parts[0]] = parts[1];
  return dict;
}, {}) || {};

// Check if a splitFile number is specified
if (!dict.splitFile || !parseInt(dict.splitFile, 10)) {
  console.warn('You\'re running tests in split mode but didn\'t specify a file to run, defaulting to the first file.');
  dict.splitFile = 1;
}

// The test-loader should be the last script in the body
var lastScript = document.querySelector('body > script:last-of-type');

// Create a script with the correct file of tests to run
var script = document.createElement('script');
script.setAttribute('src', 'assets/tests-' + dict.splitFile + '.js');

// Insert the test file before the test-loader
document.body.insertBefore(script, lastScript);

EmberENV.TESTS_FILE_LOADED = true;
