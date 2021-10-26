'use strict';

/**
 * Creates a valid query string by appending a given param and value to query.
 *
 * @param {string} query
 * @param {string} param
 * @param {string} value
 */
function addToQuery(query, param, value) {
  if (!value) {
    return query;
  }

  const queryAddParam = query ? query + '&' + param : param;

  return value !== true ? queryAddParam + '=' + value : queryAddParam;
}

/**
 * Adds a valid query string to a given url.
 *
 * @param {string} url
 * @param {string} param
 * @param {string} value
 */
function addToUrl(url, param, value) {
  const urlParts = url.split('?');
  const base = urlParts[0];
  const query = urlParts[1];

  return base + '?' + addToQuery(query, param, value);
}

module.exports = {
  addToQuery,
  addToUrl,
};
