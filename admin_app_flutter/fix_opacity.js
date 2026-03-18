const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let replacedCount = 0;
walkDir(path.join(__dirname, 'lib'), (filePath) => {
  if (filePath.endsWith('.dart')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/\.withOpacity\(([^)]+)\)/g, '.withValues(alpha: $1)');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      replacedCount++;
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log(`Replaced in ${replacedCount} files.`);
