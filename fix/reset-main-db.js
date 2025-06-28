// fix/reset-main-db.js
// Xóa file main.sqlite và hướng dẫn tạo lại cấu trúc bảng chính
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../main.sqlite');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Đã xóa file main.sqlite cũ.');
} else {
  console.log('Không tìm thấy file main.sqlite, sẽ tạo mới.');
}

console.log('Hãy khởi động lại server Node.js để Sequelize tự tạo lại bảng Shops với cấu trúc mới nhất!');
