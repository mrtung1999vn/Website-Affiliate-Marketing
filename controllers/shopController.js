// controllers/shopController.js
const { loadShopDB } = require('../models');
const { Shop } = require('../models/models-main');
const { getShopDB } = require('../utils/db-loader');
const TableModel = require('../models/Table');
const CategoryModel = require('../models/Category');
const ProductModel = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Middleware kiểm tra đăng nhập shop
function requireShopLogin(req, res, next) {
  if (req.session && req.session.shopUser && req.session.shopSlug === req.params.slug) {
    return next();
  }
  res.redirect(`/shop/${req.params.slug}/login`);
}

// Cấu hình multer cho upload ảnh
const upload = multer({ dest: path.join(__dirname, '../public/uploads') });

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
    } catch (e) { }
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
  res.render('shop/products', { products, slug });
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

// Hiển thị danh sách Table
exports.listTables = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  const tables = await Table.findAll();
  res.render('shop/tables/list', { slug, tables });
};

// Hiển thị form tạo Table
exports.showCreateTable = (req, res) => {
  res.render('shop/tables/create', { slug: req.params.slug });
};

// Xử lý tạo Table
exports.createTable = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.create({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status, // thêm status
    shopSlug: slug
  });
  res.redirect(`/shop/${slug}/tables`); // redirect thay vì trả về JSON
};

// Hiển thị form sửa Table
exports.showEditTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  const table = await Table.findByPk(id);
  res.render('shop/tables/edit', { slug, table });
};

// Xử lý sửa Table
exports.editTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.update(
    {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status // thêm status
    },
    { where: { id } }
  );
  res.redirect(`/shop/${slug}/tables`); // redirect thay vì trả về JSON
};

// Xử lý xóa Table
exports.deleteTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.destroy({ where: { id } });
  res.redirect(`/shop/${slug}/tables`); // redirect thay vì trả về JSON
};

// Hiển thị danh sách Table (viewTable)
exports.viewTable = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Table = TableModel(db);
  await Table.sync();
  const tables = await Table.findAll();

  // Lấy tên shop từ DB chính
  const shop = await Shop.findOne({ where: { slug } });
  const shopName = shop ? shop.name : slug;

  res.render('shop/tables/viewTable', { slug, tables, shopName });
};

// Hiển thị danh sách danh mục
exports.viewCategories = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Category = CategoryModel(db);
  await db.sync();
  const categories = await Category.findAll({ where: { shopSlug: slug } });
  res.render('shop/categories/viewCategories', { slug, categories });
};

// Hiển thị modal thêm danh mục (nếu dùng modal thì không cần route riêng, chỉ cần form trong viewCategories)
exports.createCategory = async (req, res) => {
  const { slug } = req.params;
  const db = getShopDB(slug);
  const Category = CategoryModel(db);
  await db.sync();
  await Category.create({
    name: req.body.name,
    description: req.body.description,
    shopSlug: slug
  });
  res.redirect(`/shop/${slug}/categories`);
};

exports.editCategory = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Category = CategoryModel(db);
  await db.sync();
  await Category.update(
    { name: req.body.name, description: req.body.description },
    { where: { id, shopSlug: slug } }
  );
  res.redirect(`/shop/${slug}/categories`);
};

exports.deleteCategory = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Category = CategoryModel(db);
  await db.sync();
  await Category.destroy({ where: { id, shopSlug: slug } });
  res.redirect(`/shop/${slug}/categories`);
};

// Hiển thị danh sách sản phẩm
exports.viewProducts = async (req, res) => {
  const slug = req.params.slug;
  const db = getShopDB(slug);
  const Product = require('../models/Product')(db);
  const Category = require('../models/Category')(db);

  // Sửa dòng này:
  await db.sync({ alter: true }); // Tự động cập nhật bảng nếu thiếu cột

  const products = await Product.findAll({ where: { shopSlug: slug } });
  const categories = await Category.findAll({ where: { shopSlug: slug } });

  res.render('shop/products/viewProducts', {
    products,
    categories,
    slug
  });
};

// Thêm sản phẩm
exports.createProduct = [
  upload.single('image'),
  async (req, res) => {
    const { slug } = req.params;
    const db = getShopDB(slug);
    const Product = ProductModel(db);
    await db.sync();
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    }
    await Product.create({
      name: req.body.name,
      categoryId: req.body.categoryId,
      price: req.body.price,
      quantity: req.body.quantity,
      attributes: req.body.attributes,
      image: imagePath,
      shopSlug: slug
    });
    res.redirect(`/shop/${slug}/products`);
  }
];

// Sửa sản phẩm
exports.editProduct = [
  upload.single('image'),
  async (req, res) => {
    const { slug, id } = req.params;
    const db = getShopDB(slug);
    const Product = ProductModel(db);
    await db.sync();
    let updateData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
      price: req.body.price,
      quantity: req.body.quantity,
      attributes: req.body.attributes
    };
    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }
    await Product.update(updateData, { where: { id, shopSlug: slug } });
    res.redirect(`/shop/${slug}/products`);
  }
];

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Product = ProductModel(db);
  await db.sync();
  await Product.destroy({ where: { id, shopSlug: slug } });
  res.redirect(`/shop/${slug}/products`);
};

// Mở order cho bàn
exports.openOrderForTable = async (req, res) => {
  const { slug, id } = req.params;
  const db = getShopDB(slug);
  const Table = require('../models/Table')(db);
  const Product = require('../models/Product')(db);
  const Category = require('../models/Category')(db);
  const Order = require('../models/Order')(db);
  const OrderItem = require('../models/OrderItem')(db);

  // Đảm bảo các bảng đã tồn tại
  await db.sync({ alter: true });

  // Tìm order "open" cho bàn này, nếu chưa có thì tạo mới
  let order = await Order.findOne({ where: { tableId: id, status: 'open' } });
  if (!order) {
    order = await Order.create({ tableId: id, status: 'open', shopSlug: slug });
    await Table.update({ status: 'occupied' }, { where: { id } });
  }

  const table = await Table.findByPk(id);
  const products = await Product.findAll({ where: { shopSlug: slug } });
  const categories = await Category.findAll({ where: { shopSlug: slug } });
  const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });

  // Lấy thông tin sản phẩm cho từng orderItem
  const itemsDetail = await Promise.all(orderItems.map(async (item) => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item.dataValues,
      productName: product ? product.name : 'N/A'
    };
  }));

  res.render('shop/tables/viewTable', {
    slug,
    table,
    order,
    products,
    categories,
    itemsDetail
  });
};

// Thêm sản phẩm vào order
exports.addProductToOrder = [requireShopLogin, async (req, res) => {
  const { slug, id } = req.params; // id ở đây là id của bàn
  const { productId, quantity } = req.body;
  const shopDB = loadShopDB(slug);
  const Order = shopDB.define('Order', {}, { tableName: 'Orders', timestamps: false });
  const OrderDetail = shopDB.define('OrderDetail', {}, { tableName: 'OrderDetails', timestamps: false });
  await shopDB.sync();

  // Tìm order đang chờ cho bàn này
  const order = await Order.findOne({ where: { tableId: id, status: 'pending' } });
  if (!order) {
    return res.status(404).send('Order không tồn tại');
  }

  // Thêm sản phẩm vào order
  await OrderDetail.create({
    orderId: order.id,
    productId,
    quantity
  });

  res.redirect(`/shop/${slug}/tables/${id}/order`);
}];

// Thanh toán cho order
exports.payOrder = [requireShopLogin, async (req, res) => {
  const { slug, id } = req.params; // id ở đây là id của bàn
  const shopDB = loadShopDB(slug);
  const Order = shopDB.define('Order', {}, { tableName: 'Orders', timestamps: false });
  await shopDB.sync();

  // Tìm order đang chờ cho bàn này
  const order = await Order.findOne({ where: { tableId: id, status: 'pending' } });
  if (!order) {
    return res.status(404).send('Order không tồn tại');
  }

  // Cập nhật trạng thái order thành đã thanh toán
  await Order.update({ status: 'paid' }, { where: { id: order.id } });

  res.redirect(`/shop/${slug}/tables/${id}/order`);
}];
