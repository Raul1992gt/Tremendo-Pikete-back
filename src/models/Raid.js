// models/Raid.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
);

// Definir el modelo 'Raid'
const Raid = sequelize.define('Raid', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Define otros atributos según sea necesario
});

module.exports = { Raid };

/*const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Raid = sequelize.define('Raid', {
  raid_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY, 
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,  
  },
  jefes_derrotados: {
    type: DataTypes.STRING, 
    allowNull: true, 
  },
});

module.exports = Raid;
*/