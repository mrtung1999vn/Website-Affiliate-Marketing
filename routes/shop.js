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
router.get('/:slug/orders', shopController.getOrders);
router.get('/:slug/reports', shopController.getReports);

// TABLE routes dùng shopController thay cho tableController
router.get('/:slug/tables', shopController.viewTable);
router.get('/:slug/tables/create', shopController.showCreateTable);
router.post('/:slug/tables/create', shopController.createTable);
router.get('/:slug/tables/:id/edit', shopController.showEditTable);
router.post('/:slug/tables/:id/edit', shopController.editTable);
router.post('/:slug/tables/:id/delete', shopController.deleteTable);

// CATEGORY routes
router.get('/:slug/categories', shopController.viewCategories);
router.post('/:slug/categories/create', shopController.createCategory);
router.post('/:slug/categories/:id/edit', shopController.editCategory);
router.post('/:slug/categories/:id/delete', shopController.deleteCategory);

// PRODUCT routes
router.get('/:slug/products', shopController.viewProducts);
router.post('/:slug/products/create', shopController.createProduct);
router.post('/:slug/products/:id/edit', shopController.editProduct);
router.post('/:slug/products/:id/delete', shopController.deleteProduct);

router.get('/:slug/tables/:id/order', shopController.openOrderForTable);
router.post('/:slug/tables/:id/order/add', shopController.addProductToOrder);
router.post('/:slug/tables/:id/order/pay', shopController.payOrder);

module.exports = router;
