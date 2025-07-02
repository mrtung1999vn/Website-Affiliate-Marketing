const { Shop } = require('../models/models-main');
const { loadShopDB } = require('../models');
const multer = require('multer');
const path = require('path');
const { getShopDB } = require('../utils/db-loader'); // Hàm lấy Sequelize instance theo slug
const TableModel = require('../models/Table');

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

      // Tạo user admin cho shop (DB riêng)
      const { loadShopDB } = require('../models');
      const shopDB = loadShopDB(req.body.slug);
      const { Sequelize, DataTypes } = require('sequelize');
      const User = shopDB.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING
      }, { tableName: 'Users', timestamps: false });
      await shopDB.sync();
      await User.create({
        username: req.body.adminUsername,
        password: req.body.adminPassword
      });

      // === Tạo bảng Tables và thêm 20 bàn mặc định ===
      const { getShopDB } = require('../utils/db-loader');
      const TableModel = require('../models/Table');
      const db = getShopDB(req.body.slug);
      const Table = TableModel(db);
      await Table.sync();
      const tables = [];
      for (let i = 1; i <= 20; i++) {
        tables.push({ name: `Bàn ${i}`, description: `Bàn số ${i}`, shopSlug: req.body.slug });
      }
      await Table.bulkCreate(tables);
      // ==============================================

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
    // Cập nhật user admin trong DB shop nếu có username hoặc password mới
    if (req.body.username) {
      const shopDB = loadShopDB(req.body.slug);
      const { Sequelize, DataTypes } = require('sequelize');
      const User = shopDB.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING
      }, { tableName: 'Users', timestamps: false });
      await shopDB.sync();
      // Nếu có mật khẩu mới, cập nhật cả username và password
      if (req.body.password) {
        await User.update(
          { username: req.body.username, password: req.body.password },
          { where: {}, limit: 1 }
        );
      } else {
        // Nếu chỉ đổi username
        await User.update(
          { username: req.body.username },
          { where: {}, limit: 1 }
        );
      }
    }
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

// Hiển thị danh sách Table
exports.listTables = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  const tables = await Table.findAll();
  res.render('admin/tables/list', { slug, tables });
};

// Hiển thị form tạo Table
exports.showCreateTable = (req, res) => {
  res.render('admin/tables/create', { slug: req.params.slug });
};

// Xử lý tạo Table
exports.createTable = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.create({
    name: req.body.name,
    description: req.body.description,
    shopSlug: slug
  });
  res.json({ success: true });
};

// Hiển thị form sửa Table
exports.showEditTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  const table = await Table.findByPk(id);
  res.render('admin/tables/edit', { slug, table });
};

// Xử lý sửa Table
exports.editTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.update(
    { name: req.body.name, description: req.body.description },
    { where: { id } }
  );
  res.json({ success: true });
};

// Xử lý xóa Table
exports.deleteTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.destroy({ where: { id } });
  res.json({ success: true });
};

exports.viewTable = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  const tables = await Table.findAll();
  // Nếu muốn lấy tên shop:
  const shopName = slug; // hoặc lấy từ DB nếu cần
  res.render('admin/tables/viewTable', { slug, shopName, tables });
};