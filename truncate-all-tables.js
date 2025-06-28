// Script: truncate-all-tables.js
// Xóa toàn bộ dữ liệu trong các bảng SQLite nhưng giữ lại cấu trúc bảng
// Chạy: node truncate-all-tables.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'main.sqlite');
const db = new sqlite3.Database(dbPath);

function getAllTables(callback) {
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`, (err, rows) => {
    if (err) return callback(err);
    const tables = rows.map(r => r.name);
    callback(null, tables);
  });
}

function truncateTables(tables, callback) {
  let i = 0;
  function next() {
    if (i >= tables.length) return callback();
    const table = tables[i++];
    db.run(`DELETE FROM "${table}";`, err => {
      if (err) return callback(err);
      db.run(`DELETE FROM sqlite_sequence WHERE name='${table}';`, () => next()); // reset AUTOINCREMENT nếu có
    });
  }
  next();
}

getAllTables((err, tables) => {
  if (err) {
    console.error('Lỗi lấy danh sách bảng:', err);
    db.close();
    return;
  }
  if (tables.length === 0) {
    console.log('Không tìm thấy bảng nào trong database.');
    db.close();
    return;
  }
  console.log('Các bảng sẽ được xóa dữ liệu:', tables.join(', '));
  truncateTables(tables, err => {
    if (err) {
      console.error('Lỗi khi xóa dữ liệu:', err);
    } else {
      console.log('Đã xóa sạch dữ liệu trong tất cả các bảng!');
    }
    db.close();
  });
});
