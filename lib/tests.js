var query = window.location.search.substring(1);
var params = query.split('&');
var dict = {};
params.forEach(function(param) {
  var parts = param.split('=');
  dict[parts[0]] = parts[1];
});

console.log(dict);

if (dict.batch) {
  var script = document.createElement('script');
  script.setAttribute('src', 'assets/tests-' + dict.batch + '.js');
  var lastScript = document.querySelector('body > script:last-of-type');
  document.body.insertBefore(script, lastScript);
  console.log('injected');
} else {
}