// controllers/shopController.js
const { loadShopDB } = require('../models');

exports.loginPage = async (req, res) => {
  const slug = req.params.slug;
  // Lấy thông tin shop theo slug
  const { Shop } = require('../models/models-main');
  let shop = null;
  if (slug) {
    shop = await Shop.findOne({ where: { slug } });
  }
  res.render('shop/login', { slug, shop });
};

exports.dashboard = async (req, res) => {
  try {
    const slug = req.params.slug;
    const shopDB = loadShopDB(slug);
    // Định nghĩa models tạm thời cho từng shop
    const User = shopDB.define('User', {}, { tableName: 'Users', timestamps: false });
    const Product = shopDB.define('Product', {}, { tableName: 'Products', timestamps: false });
    const Order = shopDB.define('Order', {}, { tableName: 'Orders', timestamps: false });
    await shopDB.sync();
    const totalUsers = await User.count().catch(() => 0);
    const totalProducts = await Product.count().catch(() => 0);
    const totalOrders = await Order.count().catch(() => 0);
    // Doanh thu: giả sử có cột 'total' trong bảng Orders
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
};

exports.getUsers = (req, res) => {
  res.render('shop/users', { users: [] });
};

exports.getProducts = (req, res) => {
  res.render('shop/products', { products: [] });
};

exports.getOrders = (req, res) => {
  res.render('shop/orders', { orders: [] });
};

exports.getReports = (req, res) => {
  res.render('shop/reports');
};
