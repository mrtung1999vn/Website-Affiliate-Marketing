const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.loginPage);
router.get('/dashboard', adminController.dashboard);
router.get('/shops/create', adminController.createShopPage);
router.post('/shops/create', adminController.createShop);
router.get('/shops', adminController.listShops);
router.post('/shops/edit/:id', adminController.editShop);
router.post('/shops/delete/:id', adminController.deleteShop);

module.exports = router;