const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Item = sequelize.define('Item', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: true,  
  },
  subtipo: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60, 
  },
});

module.exports = Item;
