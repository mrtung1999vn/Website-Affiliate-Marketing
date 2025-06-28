const { Shop } = require('../models/models-main');

// controllers/adminController.js
exports.loginPage = (req, res) => {
  res.render('admin/login');
};

exports.dashboard = (req, res) => {
  res.render('admin/dashboard');
};

exports.createShopPage = (req, res) => {
  res.render('admin/createShop');
};

exports.createShop = async (req, res) => {
  const { name, slug, owner, email } = req.body;
  // Tạo shop mới (ghi vào DB chính + tạo DB riêng) [chi tiết sẽ thêm sau]
  res.redirect('/admin/dashboard');
};

exports.listShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/listShops', { shops });
  } catch (err) {
    console.error('Lỗi lấy danh sách shop:', err);
    res.status(500).send('Lỗi server');
  }
};