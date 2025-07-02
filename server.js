const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const app = express();

// Cấu hình
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const apiRoutes = require('./routes/api');

app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  let apis = [];
  try {
    apis = JSON.parse(fs.readFileSync('api-docs.json', 'utf8'));
  } catch (e) {
    apis = [];
  }
  res.render('index', { apis });
});

// Middleware xử lý lỗi toàn cục cho Express
app.use((err, req, res, next) => {
  console.error('Lỗi:', err);
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra!', error: err.message });
  } else {
    res.status(500).render('error', { error: err });
  }
});

// Xử lý lỗi không bắt được (unhandledRejection & uncaughtException)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Không nên dừng server, chỉ log lỗi
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Không nên dừng server, chỉ log lỗi
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

module.exports = app;
