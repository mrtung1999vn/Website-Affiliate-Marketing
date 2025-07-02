const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tableId: { type: DataTypes.INTEGER, allowNull: false },
    customerName: { type: DataTypes.STRING }, // Tên khách hàng
    totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 }, // Giá trị đơn hàng tổng
    ctvId: { type: DataTypes.INTEGER }, // ID người giới thiệu (CTV)
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'open' }, // open, paid, cancelled
    shopSlug: { type: DataTypes.STRING, allowNull: false }
  });
};