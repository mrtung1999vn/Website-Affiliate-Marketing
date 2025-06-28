const { Sequelize } = require('sequelize');
const path = require('path');

function getShopDB(slug) {
  const file = path.join(__dirname, `../shop_${slug}.sqlite`);
  return new Sequelize({
    dialect: 'sqlite',
    storage: file,
    logging: false
  });
}

module.exports = { getShopDB };
