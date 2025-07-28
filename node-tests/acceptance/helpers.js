async function execa(command, args, options) {
  const { execa: originalExeca } = await import('execa');
  return originalExeca(command, args, options);
}

function getNumberOfTests(str) {
  const match = str.match(/# tests ([0-9]+)/);
  return match && parseInt(match[1], 10);
}

module.exports = { execa, getNumberOfTests };
