// controllers/shopController.js
const { loadShopDB } = require('../models');
const { Shop } = require('../models/models-main');

// Middleware kiểm tra đăng nhập shop
function requireShopLogin(req, res, next) {
  if (req.session && req.session.shopUser && req.session.shopSlug === req.params.slug) {
    return next();
  }
  res.redirect(`/shop/${req.params.slug}/login`);
}

exports.loginPage = async (req, res) => {
  const slug = req.params.slug;
  let shop = null;
  if (slug) {
    shop = await Shop.findOne({ where: { slug } });
  }
  res.render('shop/login', { slug, shop });
};

// Xử lý POST login
exports.login = async (req, res) => {
  const slug = req.params.slug;
  const { username, password } = req.body;
  const shopDB = loadShopDB(slug);
  // Định nghĩa model User
  const User = shopDB.define('User', {
    username: { type: require('sequelize').STRING },
    password: { type: require('sequelize').STRING }
  }, { tableName: 'Users', timestamps: false });
  await shopDB.sync();
  const user = await User.findOne({ where: { username, password } });
  if (user) {
    req.session.shopUser = user;
    req.session.shopSlug = slug;
    res.redirect(`/shop/${slug}/dashboard`);
  } else {
    let shop = await Shop.findOne({ where: { slug } });
    res.render('shop/login', { slug, shop, error: 'Sai tài khoản hoặc mật khẩu!' });
  }
};

// Dashboard shop (bảo vệ đăng nhập)
exports.dashboard = [requireShopLogin, async (req, res) => {
  try {
    const slug = req.params.slug;
    const shopDB = loadShopDB(slug);
    const User = shopDB.define('User', {}, { tableName: 'Users', timestamps: false });
    const Product = shopDB.define('Product', {}, { tableName: 'Products', timestamps: false });
    const Order = shopDB.define('Order', {}, { tableName: 'Orders', timestamps: false });
    await shopDB.sync();
    const totalUsers = await User.count().catch(() => 0);
    const totalProducts = await Product.count().catch(() => 0);
    const totalOrders = await Order.count().catch(() => 0);
    let totalRevenue = 0;
    try {
      const orders = await Order.findAll({ attributes: ['total'] });
      totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    } catch (e) {}
    res.render('shop/dashboard', {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (err) {
    res.render('shop/dashboard', {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    });
  }
}];

// Users
exports.getUsers = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const shopDB = loadShopDB(slug);
  const User = shopDB.define('User', {}, { tableName: 'Users', timestamps: false });
  await shopDB.sync();
  const users = await User.findAll();
  res.render('shop/users', { users, slug });
}];

// Products
exports.getProducts = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const shopDB = loadShopDB(slug);
  const Product = shopDB.define('Product', {}, { tableName: 'Products', timestamps: false });
  await shopDB.sync();
  const products = await Product.findAll();
  res.render('shop/products', { products });
}];

// Orders
exports.getOrders = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const shopDB = loadShopDB(slug);
  const Order = shopDB.define('Order', {}, { tableName: 'Orders', timestamps: false });
  await shopDB.sync();
  const orders = await Order.findAll();
  res.render('shop/orders', { orders });
}];

// Reports
exports.getReports = [requireShopLogin, (req, res) => {
  res.render('shop/reports');
}];

// Hiển thị form tạo CTV (dùng cho modal)
exports.createUserPage = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  res.render('shop/createUser', { slug });
}];

// Xử lý tạo CTV mới
exports.createUser = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const { name, phone, bank_name, bank_number, api_token } = req.body;
  const shopDB = loadShopDB(slug);
  // Định nghĩa model User (không có trường username để phân biệt với admin)
  const User = shopDB.define('User', {
    name: { type: require('sequelize').STRING },
    phone: { type: require('sequelize').STRING },
    bank_name: { type: require('sequelize').STRING },
    bank_number: { type: require('sequelize').STRING },
    api_token: { type: require('sequelize').STRING },
    is_spam: { type: require('sequelize').BOOLEAN, defaultValue: false },
    username: { type: require('sequelize').STRING }, // để phân biệt admin
    password: { type: require('sequelize').STRING }
  }, { tableName: 'Users', timestamps: false });
  await shopDB.sync();
  await User.create({ name, phone, bank_name, bank_number, api_token, is_spam: false });
  res.json({ success: true }); // trả về JSON cho modal xử lý
}];

// Hiển thị form sửa CTV (dùng cho modal)
exports.editUserPage = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const id = req.params.id;
  const shopDB = loadShopDB(slug);
  const User = shopDB.define('User', {
    name: { type: require('sequelize').STRING },
    phone: { type: require('sequelize').STRING },
    bank_name: { type: require('sequelize').STRING },
    bank_number: { type: require('sequelize').STRING },
    api_token: { type: require('sequelize').STRING },
    is_spam: { type: require('sequelize').BOOLEAN, defaultValue: false },
    username: { type: require('sequelize').STRING },
    password: { type: require('sequelize').STRING }
  }, { tableName: 'Users', timestamps: false });
  await shopDB.sync();
  const user = await User.findByPk(id);
  res.render('shop/editUser', { slug, user });
}];

// Xử lý cập nhật CTV
exports.editUser = [requireShopLogin, async (req, res) => {
  const slug = req.params.slug;
  const id = req.params.id;
  const { name, phone, bank_name, bank_number, api_token, is_spam } = req.body;
  const shopDB = loadShopDB(slug);
  const User = shopDB.define('User', {
    name: { type: require('sequelize').STRING },
    phone: { type: require('sequelize').STRING },
    bank_name: { type: require('sequelize').STRING },
    bank_number: { type: require('sequelize').STRING },
    api_token: { type: require('sequelize').STRING },
    is_spam: { type: require('sequelize').BOOLEAN, defaultValue: false },
    username: { type: require('sequelize').STRING },
    password: { type: require('sequelize').STRING }
  }, { tableName: 'Users', timestamps: false });
  await shopDB.sync();
  await User.update({ name, phone, bank_name, bank_number, api_token, is_spam: !!is_spam }, { where: { id } });
  res.json({ success: true });
}];

// Đăng xuất
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect(`/shop/${req.params.slug}/login`);
  });
};
