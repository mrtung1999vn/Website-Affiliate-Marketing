// models/models-main.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'main.sqlite'),
  logging: false
});

const Shop = sequelize.define('Shop', {
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  owner: DataTypes.STRING,
  email: DataTypes.STRING,
  dbFile: DataTypes.STRING
});

module.exports = { sequelize, Shop };
