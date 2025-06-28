const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'main.sqlite');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Đã xóa file main.sqlite cũ.');
} else {
  console.log('Không tìm thấy file main.sqlite, sẽ tạo mới.');
}

// Sequelize sẽ tự tạo lại bảng khi bạn chạy lại server (do có sequelize.sync() trong models/models-main.js)
console.log('Bạn hãy khởi động lại server Node.js để tạo lại bảng Shops với đầy đủ các cột mới nhất!');
