const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  

const Usuario = sequelize.define('Usuario', {
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Usuario;
