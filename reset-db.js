const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dir = __dirname;
const files = fs.readdirSync(dir);

// Xoá tất cả file .sqlite cùng cấp
files.forEach(file => {
  if (file.endsWith('.sqlite')) {
    fs.unlinkSync(path.join(dir, file));
    console.log('Đã xoá:', file);
  }
});

console.log('Đã xoá xong tất cả file .sqlite!');

// Tạo lại file main.sqlite rỗng
const dbPath = path.join(dir, 'main.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không tạo được main.sqlite:', err.message);
  } else {
    console.log('Đã tạo lại file main.sqlite rỗng.');
  }
});