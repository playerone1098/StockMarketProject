const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '../src/version.js');

try {
  if (!fs.existsSync(versionFilePath)) {
    console.error(`Version file not found at ${versionFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(versionFilePath, 'utf8');
  
  // Regex to match: export const VERSION = 'x.y.z';
  const versionRegex = /export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/i;
  const match = fileContent.match(versionRegex);

  if (!match) {
    console.error('Could not find VERSION pattern in version.js');
    process.exit(1);
  }

  const currentVersion = match[1];
  const parts = currentVersion.split('.').map(Number);

  if (parts.length !== 3 || parts.some(isNaN)) {
    console.error(`Invalid version format: ${currentVersion}`);
    process.exit(1);
  }

  // Increment the patch version (0.0.1)
  parts[2] += 1;
  const newVersion = parts.join('.');

  const newContent = fileContent.replace(versionRegex, `export const VERSION = '${newVersion}'`);
  fs.writeFileSync(versionFilePath, newContent, 'utf8');

  console.log(`Successfully incremented version from ${currentVersion} to ${newVersion}`);
} catch (error) {
  console.error('Error incrementing version:', error);
  process.exit(1);
}
