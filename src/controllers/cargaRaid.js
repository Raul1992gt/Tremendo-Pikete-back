const multer = require('multer');
const upload = multer({ dest: '../../updloads/' }); // Puedes ajustar el destino de la carga
const { pool } = require('../config/db')

const fs = require('fs');
const path = require('path');

const procesarRaid = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No se ha cargado ningún archivo' });
        }

        // Obtener la ruta del archivo
        const filePath = path.join(__dirname, '../../updloads', file.filename);

        // Leer el contenido del archivo
        const raidData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Procesar cada entrada en el JSON
        for (const entry of raidData) {
            const { player, date, class: clase, itemID, itemName, subType, equipLoc, response, note, instance, boss } = entry;

            // Eliminar sufijo del servidor y convertir a minúsculas
            const playerName = player.split('-')[0];

            // Verificar si el jugador ya existe (ignorando mayúsculas y servidor del jugador (TODOS LIVING-FLAME))
            let result = await pool.query('SELECT player_id FROM jugadores WHERE LOWER(nombre) = LOWER($1)', [playerName]);
            let player_id;
            if (result.rows.length === 0) {
                let insertPlayer = await pool.query(
                    'INSERT INTO jugadores (nombre, clase) VALUES ($1, $2) RETURNING player_id',
                    [playerName, clase]
                );
                player_id = insertPlayer.rows[0].player_id;
            } else {
                player_id = result.rows[0].player_id;
            }

            // Verificar si el item ya existe
            result = await pool.query('SELECT item_id FROM items WHERE LOWER(nombre) = LOWER($1)', [itemName]);
            let item_id;
            if (result.rows.length === 0) {
                let insertItem = await pool.query(
                    'INSERT INTO items (nombre, tipo, subtipo) VALUES ($1, $2, $3) RETURNING item_id',
                    [itemName, equipLoc, subType]
                );
                item_id = insertItem.rows[0].item_id;
            } else {
                item_id = result.rows[0].item_id;
            }

            // Verificar si la raid ya existe
            result = await pool.query('SELECT raid_id FROM raids WHERE fecha = $1 AND LOWER(nombre) = LOWER($2)', [date, instance]);
            let raid_id;
            if (result.rows.length === 0) {
                let insertRaid = await pool.query(
                    'INSERT INTO raids (fecha, nombre) VALUES ($1, $2) RETURNING raid_id',
                    [date, instance]
                );
                raid_id = insertRaid.rows[0].raid_id;
            } else {
                raid_id = result.rows[0].raid_id;
            }

            console.log(`Asignando item a player_id: ${player_id}, nombre: ${playerName}`);
            // Insertar la asignación del item
            await pool.query(
                'INSERT INTO asignacion_items (player_id, item_id, raid_id, fecha_asignacion, itemID, note, respuesta) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [player_id, item_id, raid_id, date, itemID, note, response]
            );
        }

        res.status(201).json({ message: 'Raid procesado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error procesando el raid', error });
    }
};

module.exports = { procesarRaid };
