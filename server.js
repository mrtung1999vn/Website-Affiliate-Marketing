const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Nếu chạy sau proxy (Nginx)

app.use(helmet()); // ⚠️ Bảo vệ HTTP header

// Giới hạn request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 yêu cầu mỗi IP mỗi 15 phút
  message: 'Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau.'
});
app.use(limiter);

// Cấu hình Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Cấu hình session bảo mật hơn
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
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

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi:', err);
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } else {
    res.status(500).render('error', {
      error: process.env.NODE_ENV === 'development' ? err : null
    });
  }
});

// Bắt lỗi không xử lý
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

module.exports = app;
