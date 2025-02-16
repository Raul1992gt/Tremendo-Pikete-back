const { pool } = require('../config/db'); // Asegúrate de importar el pool correctamente

const obtenerItemsPorId = async (req, res) => {
    const { id } = req.params; // Extrae el ID de los parámetros de la URL

    const client = await pool.connect(); // Conecta con el cliente
    try {
        const result = await client.query(
            'SELECT i.nombre, i.tipo, i.subtipo, i.nivel FROM asignacion_items ai JOIN items i ON ai.item_id = i.item_id WHERE ai.player_id = $1',
            [id] // Se usa un array para evitar inyección SQL
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron ítems para este usuario' });
        }

        res.json(result.rows); // Devolver todos los ítems encontrados
    } catch (error) {
        console.error('Error al obtener los ítems:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release(); // Libera el cliente después de la consulta
    }
};

module.exports = { obtenerItemsPorId };
