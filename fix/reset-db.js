// fix/reset-db.js
// Xóa tất cả file shop_*.sqlite và main.sqlite (reset toàn bộ hệ thống về trạng thái trắng)
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir);
let count = 0;
files.forEach(f => {
  if (/^shop_.+\.sqlite$/.test(f) || f === 'main.sqlite') {
    fs.unlinkSync(path.join(dir, f));
    count++;
    console.log('Đã xóa:', f);
  }
});
if (count === 0) {
  console.log('Không tìm thấy file shop_*.sqlite hoặc main.sqlite để xóa.');
} else {
  console.log('Đã xóa xong', count, 'file database.');
}
console.log('Hãy khởi động lại server Node.js để tạo lại database mới!');
