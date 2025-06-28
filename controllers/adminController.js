const { Shop } = require('../models/models-main');

// controllers/adminController.js
exports.loginPage = (req, res) => {
  res.render('admin/login');
};

exports.dashboard = (req, res) => {
  res.render('admin/dashboard');
};

exports.createShopPage = async (req, res) => {
  let shops = [];
  try {
    shops = await Shop.findAll({ order: [['id', 'DESC']] });
  } catch (err) {
    console.error('Lỗi lấy danh sách shop:', err.message);
    // Nếu lỗi "no such table", vẫn render view với shops rỗng
  }
  res.render('admin/createShop', { shops });
};

exports.createShop = async (req, res) => {
  console.log('Dữ liệu nhận từ form:', req.body);

  // Thêm shop mới vào database
  const newShop = await Shop.create({
    name: req.body.name,
    slug: req.body.slug,
    owner: req.body.owner,
    email: req.body.email,
    dbFile: '' // hoặc giá trị phù hợp nếu có
  });

  console.log('Shop vừa tạo:', newShop.toJSON());

  // Sau khi tạo xong, lấy lại danh sách shop mới nhất
  const shops = await Shop.findAll({ order: [['id', 'DESC']] });
  console.log('Danh sách shop hiện tại:', shops.map(s => s.toJSON()));

  res.render('admin/createShop', { success: 'Tạo shop mới thành công!', shops });
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

exports.editShop = async (req, res) => {
  const id = req.params.id;
  try {
    await Shop.update(
      {
        name: req.body.name,
        slug: req.body.slug,
        owner: req.body.owner,
        email: req.body.email
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