const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
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
  res.render('index', {
    apis: [
      {
        method: 'GET',
        path: '/api/ping',
        desc: 'Kiểm tra API sống',
        exampleRequest: 'GET /api/ping',
        exampleResponse: `{
  "message": "API is alive"
}`
      },
      {
        method: 'GET',
        path: '/admin/login',
        desc: 'Đăng nhập admin',
        exampleRequest: 'GET /admin/login',
        exampleResponse: 'Trả về trang HTML form đăng nhập'
      },
      {
        method: 'GET',
        path: '/admin/shops/create',
        desc: 'Tạo shop mới',
        exampleRequest: 'GET /admin/shops/create',
        exampleResponse: 'Trả về trang HTML form tạo shop'
      },
      {
        method: 'GET',
        path: '/shop/:slug/login',
        desc: 'Đăng nhập chủ shop',
        exampleRequest: 'GET /shop/ten-shop/login',
        exampleResponse: 'Trả về trang HTML form đăng nhập chủ shop'
      }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
