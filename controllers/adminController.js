const { Shop } = require('../models/models-main');
const { loadShopDB } = require('../models');
const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = Date.now() + '-' + Math.round(Math.random()*1e6) + ext;
      cb(null, name);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ cho phép upload ảnh!'));
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// controllers/adminController.js
exports.loginPage = (req, res) => {
  res.render('admin/login');
};

exports.dashboard = async (req, res) => {
  try {
    const totalShops = await Shop.count();
    let totalAffiliates = 0;
    let totalProducts = 0;
    const shops = await Shop.findAll();
    for (const shop of shops) {
      try {
        const shopDB = loadShopDB(shop.slug);
        // Định nghĩa models tạm thời cho từng shop
        const User = shopDB.define('User', {}, { tableName: 'Users', timestamps: false });
        const Product = shopDB.define('Product', {}, { tableName: 'Products', timestamps: false });
        await shopDB.sync();
        const ctvCount = await User.count().catch(() => 0);
        const productCount = await Product.count().catch(() => 0);
        totalAffiliates += ctvCount;
        totalProducts += productCount;
      } catch (e) {
        // Nếu lỗi (chưa có db hoặc bảng), bỏ qua shop này
      }
    }
    res.render('admin/dashboard', { totalShops, totalAffiliates, totalProducts });
  } catch (err) {
    console.error('Lỗi lấy tổng số shop:', err.message);
    res.render('admin/dashboard', { totalShops: 0, totalAffiliates: 0, totalProducts: 0 });
  }
};

exports.createShopPage = async (req, res) => {
  let shops = [];
  try {
    shops = await Shop.findAll({ order: [['id', 'DESC']] });
  } catch (err) {
    console.error('Lỗi lấy danh sách shop:', err.message);
  }
  res.render('admin/createShop', { shops });
};

exports.createShop = [
  upload.single('logo'),
  async (req, res) => {
    try {
      // Chỉ lưu tên file, không lưu kèm /uploads/
      const logoPath = req.file ? req.file.filename : '';
      const newShop = await Shop.create({
        name: req.body.name,
        slug: req.body.slug,
        owner: req.body.owner,
        email: req.body.email,
        logo: logoPath,
        dbFile: ''
      });
      const shops = await Shop.findAll({ order: [['id', 'DESC']] });
      res.render('admin/createShop', { success: 'Tạo shop mới thành công!', shops });
    } catch (err) {
      const shops = await Shop.findAll({ order: [['id', 'DESC']] });
      res.render('admin/createShop', { error: 'Có lỗi khi tạo shop!', shops });
    }
  }
];

exports.listShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/listShops', { shops });
  } catch (err) {
    console.error('Lỗi lấy danh sách shop:', err);
    res.status(500).send('Lỗi server');
  }
};

exports.editShop = async (req, res) => {
  const id = req.params.id;
  try {
    // Lấy shop hiện tại để lấy logo cũ nếu cần xóa
    const shop = await Shop.findByPk(id);
    let logoPath = shop.logo;
    if (req.file) {
      // Nếu upload logo mới, cập nhật đường dẫn mới
      logoPath = req.file.filename;
      // (Tùy chọn) Xóa file cũ nếu có và khác rỗng
      if (shop.logo && shop.logo !== '' && shop.logo !== req.file.filename) {
        const fs = require('fs');
        const oldPath = require('path').join(__dirname, '../public/uploads', shop.logo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    await Shop.update(
      {
        name: req.body.name,
        slug: req.body.slug,
        owner: req.body.owner,
        email: req.body.email,
        logo: logoPath
      },
      { where: { id } }
    );
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/createShop', { success: 'Đã sửa shop thành công!', shops });
  } catch (err) {
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/createShop', { error: 'Có lỗi khi sửa shop!', shops });
  }
};

exports.deleteShop = async (req, res) => {
  const id = req.params.id;
  try {
    await Shop.destroy({ where: { id } });
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/createShop', { success: 'Đã xoá shop thành công!', shops });
  } catch (err) {
    const shops = await Shop.findAll({ order: [['id', 'DESC']] });
    res.render('admin/createShop', { error: 'Có lỗi khi xoá shop!', shops });
  }
};