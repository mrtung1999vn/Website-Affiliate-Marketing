// fix/truncate-all-tables.js
// Script xóa sạch dữ liệu các bảng trong tất cả file shop_*.sqlite (không xóa cấu trúc bảng)
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SHOP_DB_PATTERN = /^shop_(.+)\.sqlite$/;

function getShopDbFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => SHOP_DB_PATTERN.test(f));
}

function truncateAllTables(dbPath) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
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
        let pending = tables.length;
        if (pending === 0) {
          db.close();
          resolve({ dbPath, truncated: true });
          return;
        }
        tables.forEach(t => {
          db.run(`DELETE FROM ${t.name};`, [], (err) => {
            if (--pending === 0) {
              db.close();
              resolve({ dbPath, truncated: true });
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
    const result = await truncateAllTables(dbPath);
    if (result.error) {
      console.log(`[${path.basename(dbPath)}] LỖI: ${result.error}`);
    } else {
      console.log(`[${path.basename(dbPath)}] Đã xóa sạch dữ liệu các bảng.`);
    }
  }
  console.log('Hoàn tất truncate all tables.');
}

main();
