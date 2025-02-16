const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AsignacionItem = sequelize.define('AsignacionItem', {
  assignment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jugadores',
      key: 'player_id',
    },
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'item_id',
    },
  },
  raid_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'raids',
      key: 'raid_id',
    },
  },
  fecha_asignacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = AsignacionItem;
