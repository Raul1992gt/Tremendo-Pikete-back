const Raid = require('./Raid');
const Jugador = require('./jugador');
const Item = require('./Item');
const AsignacionItem = require('./AsignacionItem');


// Relación entre Raid y Jugadores (muchos a muchos a través de AsignacionItem)
Raid.belongsToMany(Jugador, { through: AsignacionItem, foreignKey: 'raid_id' });
Jugador.belongsToMany(Raid, { through: AsignacionItem, foreignKey: 'player_id' });

// Relación entre Raid y AsignacionItem
Raid.hasMany(AsignacionItem, { foreignKey: 'raid_id' });

// Relación entre Jugador y AsignacionItem
Jugador.hasMany(AsignacionItem, { foreignKey: 'player_id' });

// Relación entre Item y AsignacionItem
Item.hasMany(AsignacionItem, { foreignKey: 'item_id' });

module.exports = { Raid, Jugador, Item, AsignacionItem };
