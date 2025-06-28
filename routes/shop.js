const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/:slug/login', shopController.loginPage);
router.post('/:slug/login', shopController.login);
router.get('/:slug/dashboard', shopController.dashboard);
router.get('/:slug/users', shopController.getUsers);
router.get('/:slug/products', shopController.getProducts);
router.get('/:slug/orders', shopController.getOrders);
router.get('/:slug/reports', shopController.getReports);

module.exports = router;
