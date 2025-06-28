// migrate-shop-dbs.js
// Script tự động migrate các file shop_*.sqlite để đảm bảo bảng Users có đủ cột username/password
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SHOP_DB_PATTERN = /^shop_(.+)\.sqlite$/;
const REQUIRED_COLUMNS = [
  { name: 'username', type: 'TEXT' },
  { name: 'password', type: 'TEXT' }
];

function getShopDbFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => SHOP_DB_PATTERN.test(f));
}

function checkAndMigrateDb(dbPath) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        resolve({ dbPath, error: err.message });
        return;
      }
      db.all(`PRAGMA table_info(Users);`, [], (err, columns) => {
        if (err) {
          db.close();
          resolve({ dbPath, error: 'Không tìm thấy bảng Users.' });
          return;
        }
        const colNames = columns.map(c => c.name);
        let migrated = false;
        let alterSqls = [];
        for (const col of REQUIRED_COLUMNS) {
          if (!colNames.includes(col.name)) {
            alterSqls.push(`ALTER TABLE Users ADD COLUMN ${col.name} ${col.type};`);
          }
        }
        function next(i) {
          if (i >= alterSqls.length) {
            db.close();
            resolve({ dbPath, migrated, error: null });
            return;
          }
          db.run(alterSqls[i], [], (err) => {
            if (!err) migrated = true;
            next(i + 1);
          });
        }
        if (alterSqls.length > 0) {
          next(0);
        } else {
          db.close();
          resolve({ dbPath, migrated: false, error: null });
        }
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
  console.log(`Đang kiểm tra ${files.length} file shop_*.sqlite...`);
  for (const file of files) {
    const dbPath = path.join(dir, file);
    const result = await checkAndMigrateDb(dbPath);
    if (result.error) {
      console.log(`[${file}] LỖI: ${result.error}`);
    } else if (result.migrated) {
      console.log(`[${file}] Đã migrate: Đã thêm cột còn thiếu.`);
    } else {
      console.log(`[${file}] OK: Đã đủ cấu trúc Users.`);
    }
  }
  console.log('Hoàn tất migrate database shop.');
}

main();
