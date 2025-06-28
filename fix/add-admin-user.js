// fix/add-admin-user.js
// Script thêm hoặc cập nhật user admin cho shop theo slug
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

if (process.argv.length < 5) {
  console.log('Cách dùng: node fix/add-admin-user.js <shop_slug> <username> <password>');
  process.exit(1);
}

const slug = process.argv[2];
const username = process.argv[3];
const password = process.argv[4];
const dbPath = path.join(__dirname, `../shop_${slug}.sqlite`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Không mở được database:', err.message);
    return;
  }
  db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
    if (row) {
      db.run('UPDATE Users SET password = ? WHERE username = ?', [password, username], function(err) {
        if (err) {
          console.error('Lỗi khi cập nhật user:', err.message);
        } else {
          console.log('Đã cập nhật mật khẩu cho user:', username);
        }
        db.close();
      });
    } else {
      db.run('INSERT INTO Users (username, password) VALUES (?, ?)', [username, password], function(err) {
        if (err) {
          console.error('Lỗi khi thêm user:', err.message);
        } else {
          console.log('Đã thêm user admin:', username, '/', password);
        }
        db.close();
      });
    }
  });
});
