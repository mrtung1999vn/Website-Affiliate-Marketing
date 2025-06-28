const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/:slug/login', shopController.loginPage);
router.post('/:slug/login', shopController.login);
router.get('/:slug/dashboard', shopController.dashboard);
router.get('/:slug/users', shopController.getUsers);
router.get('/:slug/users/create', shopController.createUserPage);
router.post('/:slug/users/create', shopController.createUser);
router.get('/:slug/users/edit/:id', shopController.editUserPage);
router.post('/:slug/users/edit/:id', shopController.editUser);
router.get('/:slug/products', shopController.getProducts);
router.get('/:slug/orders', shopController.getOrders);
router.get('/:slug/reports', shopController.getReports);

module.exports = router;
