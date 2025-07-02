const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

router.get('/login', adminController.loginPage);
router.get('/dashboard', adminController.dashboard);
router.get('/shops/create', adminController.createShopPage);
router.post('/shops/create', adminController.createShop);
router.get('/shops', adminController.listShops);
router.post('/shops/edit/:id', upload.single('logo'), adminController.editShop);
router.post('/shops/delete/:id', adminController.deleteShop);

// Hiển thị danh sách Table của shop (viewTable)
router.get('/shops/:slug/tables', adminController.viewTable);
router.get('/shops/:slug/tables/create', adminController.showCreateTable);
router.post('/shops/:slug/tables/create', adminController.createTable);
router.get('/shops/:slug/tables/:id/edit', adminController.showEditTable);
router.post('/shops/:slug/tables/:id/edit', adminController.editTable);
router.post('/shops/:slug/tables/:id/delete', adminController.deleteTable);

module.exports = router;