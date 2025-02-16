const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const Jugador = require('../models/jugador');

const Jugador = sequelize.define('Jugador', {
  player_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clase: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  puntos_asistencia: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Jugador;
