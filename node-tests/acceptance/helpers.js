const path = require('path');
const fsExtra = require('fs-extra');

async function execa(command, args, options) {
  const { execa: originalExeca } = await import('execa');
  return originalExeca(command, args, options);
}

function getNumberOfTests(str) {
  const match = str.match(/# tests ([0-9]+)/);
  return match && parseInt(match[1], 10);
}

const ROOT = path.resolve(__dirname, '../../');
const FIXTURE_DIR = path.resolve(ROOT, 'node-tests/fixtures');

function applyFixture({ fixture, to }) {
  fsExtra.copySync(path.join(FIXTURE_DIR, fixture), to);
}

module.exports = { execa, getNumberOfTests, applyFixture, ROOT };
