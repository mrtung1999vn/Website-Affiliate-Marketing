const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
  const files = fs.readdirSync(dir)
    .filter(f => !f.startsWith('.') && f !== 'node_modules')
    .sort();
  files.forEach((file, idx) => {
    const isLast = idx === files.length - 1;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const pointer = isLast ? '└── ' : '├── ';
    console.log(prefix + pointer + file);
    if (stat.isDirectory()) {
      printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  });
}

console.log(path.basename(process.cwd()) + '/');
printTree(process.cwd());