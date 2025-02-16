const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const obtenerJugadores = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM jugadores");
        return res.rows;
    } catch (err) {
        console.error('Error en la consulta de jugadores:', err);
        throw err;
    } finally {
        client.release();
    }
};

const obtenerJugadoresController = async (req, res) => {
    try {
        const jugadores = await obtenerJugadores();
        if (jugadores.length === 0) {
            return res.status(204).send('No hay jugadores disponibles');
        }
        res.json(jugadores);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener jugadores');
    }
};


module.exports = { obtenerJugadores, obtenerJugadoresController, pool };