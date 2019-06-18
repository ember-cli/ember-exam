// A regular expression to help parsing a string to verify regex.
const MODULE_PATH_REGEXP = /^(!?)\/(.*)\/(i?)$/;
const TEST_PATH_REGEX = /\/tests\/(.*?)$/;

/**
 * Return the matched test.
 * e.g. if an input is '!/weight/' it returns an array, ['!/weight/', '!', 'weight', ''];
 *
 * @param {*} modulePath
 */
function getRegexFilter(modulePath) {
  return MODULE_PATH_REGEXP.exec( modulePath );
}

/**
 * Determine if a given module path is matched with module filter with wildcard.
 * e.g. A given moduleFilter, /tests/integration/*, matches with /tests/integration/foo and /tests/integration/bar
 *
 * @param {*} module
 * @param {*} moduleFilter
 */
function wildcardFilter(module, moduleFilter) {
  // Generate a regular expression to handle wildcard from path filter
  const moduleFilterRule = ['^.*', moduleFilter.split('*').join('.*'), '$'].join('');
  return new RegExp(moduleFilterRule).test(module);
}

/**
 * Return a list of test modules that contain a given module path string.
 *
 * @param {Array<string>} modules
 * @param {string} moduleFilter
 */
function stringFilter(modules, moduleFilter) {
  return modules.filter( module => module.includes(moduleFilter) || wildcardFilter(module, moduleFilter) );
}

/**
 * Return a list of test modules that matches with a given regular expression.
 *
 * @param {Array<string>} modules
 * @param {Array<string>} modulePathRegexFilter
 */
function regexFilter(modules, modulePathRegexFilter) {
  const re = new RegExp(modulePathRegexFilter[2], modulePathRegexFilter[3]);
  const exclude = modulePathRegexFilter[1];

  return modules.filter( module => !exclude && re.test(module) || exclude && !re.test(module) );
}

/**
 * Return a module path that's mapped by a given test file path.
 *
 * @param {*} filePath
 */
function convertFilePathToModulePath(filePath) {
  const filePathWithNoExtension = filePath.replace(/\.[^/.]+$/, '');
  const testFilePathMatch =  TEST_PATH_REGEX.exec( filePathWithNoExtension );
  if (typeof filePath !== 'undefined' && testFilePathMatch !== null) {
    return testFilePathMatch[0];
  }

  return filePathWithNoExtension;
}

/**
 * Returns a list of test modules that match with the given module path filter or test file path.
 *
 * @param {Array<string>} modules
 * @param {string} modulePath
 * @param {string} filePath
 */
function filterTestModules(modules, modulePath, filePath) {
  // Generates an array with module filter value seperated by comma (,).
  const moduleFilters = (filePath || modulePath).split(',').map( value => value.trim());

  return moduleFilters.reduce((result, moduleFilter) => {
    const modulePath = convertFilePathToModulePath(moduleFilter);
    const modulePathRegex = getRegexFilter(modulePath);

    if (modulePathRegex) {
      return result.concat(regexFilter(modules, modulePathRegex).filter( module => result.indexOf(module) === -1 ));
    } else {
      return result.concat(stringFilter(modules, modulePath).filter( module => result.indexOf(module) === -1 ));
    }
  }, []);
}

export {
  convertFilePathToModulePath,
  filterTestModules
}
