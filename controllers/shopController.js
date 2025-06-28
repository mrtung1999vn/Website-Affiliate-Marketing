// controllers/shopController.js
exports.loginPage = (req, res) => {
  res.render('shop/login');
};

exports.dashboard = (req, res) => {
  res.render('shop/dashboard');
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
