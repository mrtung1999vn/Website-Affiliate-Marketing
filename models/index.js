// models/index.js
const { Sequelize } = require('sequelize');
const path = require('path');

const loadShopDB = (shopSlug) => {
  const dbPath = path.join(__dirname, '..', `shop_${shopSlug}.sqlite`);
  return new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });
};

module.exports = { loadShopDB };
