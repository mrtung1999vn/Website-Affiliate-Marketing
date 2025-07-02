const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Table = sequelize.define('Table', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    shopSlug: { type: DataTypes.STRING, allowNull: false }, // liên kết shop
  });
  return Table;
};