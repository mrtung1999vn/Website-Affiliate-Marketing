// controllers/affiliateController.js
exports.getAll = async (req, res) => {
  // Truy vấn affiliate trong shop DB hiện tại
  res.render('shop/affiliates', { data: [] });
};

exports.settlePayments = async (req, res) => {
  // Quyết toán hoa hồng
  res.redirect('/shop/' + req.shopSlug + '/affiliates');
};
