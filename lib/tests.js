// Extract the query parameters into a dictionary
var query = window.location.search.substring(1);
var params = query.split('&');
var dict = params.reduce(function(dict, param) {
  var parts = param.split('=');
  dict[parts[0]] = parts[1];
}, {}) || {};

// Check if a batch number is specified
if (!dict.batch || !parseInt(dict.batch, 10)) {
  console.info('You\'re running tests in split mode but didn\'t specify a file to run, defaulting to the first file.');
  dict.batch = 1;
}

// The test-loader should be the last script in the body
var lastScript = document.querySelector('body > script:last-of-type');

// Create a script with the correct batch of tests to run
var script = document.createElement('script');
script.setAttribute('src', 'assets/tests-' + dict.batch + '.js');

// Insert the test batch before the test-loader
document.body.insertBefore(script, lastScript);

EmberENV.TESTS_FILE_LOADED = true;
