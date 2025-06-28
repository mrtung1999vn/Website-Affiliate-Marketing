// fix/show-structure.js
// Script hiển thị cấu trúc bảng của tất cả các file shop_*.sqlite
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SHOP_DB_PATTERN = /^shop_(.+)\.sqlite$/;

function getShopDbFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => SHOP_DB_PATTERN.test(f));
}

function showStructure(dbPath) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        resolve({ dbPath, error: err.message });
        return;
      }
      db.all(`SELECT name FROM sqlite_master WHERE type='table';`, [], (err, tables) => {
        if (err) {
          db.close();
          resolve({ dbPath, error: err.message });
          return;
        }
        let result = `\n[${path.basename(dbPath)}]`;
        let pending = tables.length;
        if (pending === 0) {
          db.close();
          resolve(result + '\n  (Không có bảng nào)');
          return;
        }
        tables.forEach(t => {
          db.all(`PRAGMA table_info(${t.name});`, [], (err, columns) => {
            result += `\n  Table: ${t.name}`;
            if (columns && columns.length > 0) {
              columns.forEach(col => {
                result += `\n    - ${col.name} (${col.type})`;
              });
            } else {
              result += '\n    (Không có cột)';
            }
            if (--pending === 0) {
              db.close();
              resolve(result);
            }
          });
        });
      });
    });
  });
}

async function main() {
  const dir = __dirname;
  const files = getShopDbFiles(dir);
  if (files.length === 0) {
    console.log('Không tìm thấy file shop_*.sqlite nào.');
    return;
  }
  for (const file of files) {
    const dbPath = path.join(dir, file);
    const result = await showStructure(dbPath);
    console.log(result);
  }
  console.log('\nHoàn tất show structure.');
}

main();
