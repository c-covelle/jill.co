const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.json')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src/assets');

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace unescaped backslashes that are followed by characters other than valid JSON escape sequences (" \ / b f n r t u)
  const fixed = content.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  
  try {
    JSON.parse(fixed);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`[FIXED & VALID] ${filePath}`);
  } catch (err) {
    console.error(`[ERROR] Could not auto-parse ${filePath}: ${err.message}`);
  }
});
