const { pool, obtenerJugadores } = require('../config/db');
const { jsPDF } = require("jspdf");
require("jspdf-autotable");

// Controlador que maneja la solicitud de jugadores
const obtenerJugadoresController = async (req, res) => {
    try {
        const jugadores = await obtenerJugadores(); 
        res.json(jugadores);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener jugadores');
    }
};

// Función que obtiene la cantidad de items recibidos por cada jugador
const obtenerItemsTotalesPorJugadorController = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                j.player_id,
                j.nombre, 
                j.clase, 
                j.rol, 
                COUNT(i.item_id) AS items_count 
            FROM 
                jugadores j
            LEFT JOIN 
                asignacion_items ai ON j.player_id = ai.player_id
            LEFT JOIN 
                items i ON ai.item_id = i.item_id
            GROUP BY 
                j.player_id
            ORDER BY 
                items_count DESC;  -- Ordenamos por cantidad de ítems recibidos
        `);

        if (!result.rows.length) {
            return res.status(404).json({ error: 'No se encontraron jugadores o ítems registrados.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener los jugadores y su cantidad de ítems:', error);
        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.' });
    }
};

// Función que obtiene los items recibidos por un jugador específico
const obtenerItemsPorJugadorController = async (req, res) => {
    const {id} = req.params; // Obtiene el player_id desde los parámetros de la URL
    const client = await pool.connect(); // Conectar con el cliente

    try {
        const result = await client.query(
            `select j.nombre jugadorNombre, j.clase jugadorClase, j.rol jugadorRol, 
                i.nombre nombreItem, i.tipo tipoItem, i.subtipo subTipoItem 
            from asignacion_items ai 
            join jugadores j on j.player_id = ai.player_id 
            join items i on i.item_id  = ai.item_id 
            where j.player_id = $1`, 
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron ítems para este jugador' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los items del jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release(); // Liberar el cliente después de la consulta
    }
};

const organizarPrioridadesController = async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT 
                j.player_id, 
                j.nombre, 
                j.clase, 
                j.rol, 
                i.nombre as nombreItem, 
                i.tipo as tipoItem, 
                i.subtipo as subTipoItem,
                j.puntos_asistencia
            FROM 
                jugadores j
            LEFT JOIN 
                asignacion_items ai ON j.player_id = ai.player_id
            LEFT JOIN 
                items i ON ai.item_id = i.item_id`
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron jugadores ni ítems' });
        }

        const jugadores = result.rows.reduce((acc, row) => {
            const { player_id, nombre, clase, rol, nombreitem, tipoitem, subtipoitem, puntos_asistencia } = row;

            if (!acc[player_id]) {
                acc[player_id] = {
                    nombre,
                    clase,
                    rol,
                    puntos_asistencia,
                    totalItems: 0,
                    items: [],
                    contadorItems: 0,
                    prioridad: 0,
                    desglosePrio: {} // Nuevo campo para almacenar el desglose de puntos
                };
            }

            acc[player_id].items.push({ nombreitem, tipoitem, subtipoitem });

            if (nombreitem?.includes("Desecrated")) {
                acc[player_id].contadorItems++;
            }

            return acc;
        }, {});

        const jugadoresConPrioridad = Object.values(jugadores).map(jugador => {
            let prioridad = 0;
            let puntos = 0;
            let penalizacionItems = 0;
            let prioPorAsistencia = jugador.puntos_asistencia * 10;
            let detalles = [];
        
            // Asignar puntos por Desecrated
            switch (jugador.contadorItems) {
                case 0: 
                    puntos = 50;
                    detalles.push("50 puntos por no tener Desecrated.");
                    break;
                case 1: 
                    puntos = 60;
                    detalles.push("60 puntos por tener 1 Desecrated.");
                    break;
                case 2: 
                    puntos = 30;
                    detalles.push("30 puntos por tener 2 Desecrated.");
                    break;
                case 3: 
                    puntos = 40;
                    detalles.push("40 puntos por tener 3 Desecrated.");
                    break;
                case 4: 
                    puntos = 15;
                    detalles.push("15 puntos por tener 4 Desecrated.");
                    break;
                case 5: 
                    puntos = 25;
                    detalles.push("25 puntos por tener 5 Desecrated.");
                    break;
                default: 
                    puntos = 0;
                    detalles.push("0 puntos por tener más de 5 Desecrated.");
                    break;
            }
        
            // Ajustar la prioridad por asistencia
            if (jugador.puntos_asistencia === 0) {
                prioridad = 0;
                prioPorAsistencia = 0;
                detalles.push("0 puntos por no haber asistido.");
            } else {
                prioridad += puntos + prioPorAsistencia;
                detalles.push(`+${prioPorAsistencia} puntos por asistencia (${jugador.puntos_asistencia} asistencias).`);
            }
        
            // Penalización por items obtenidos
            if (jugador.items) {
                jugador.items.forEach(item => {
                    if (item?.nombreitem) {
                        penalizacionItems -= 5;
                        detalles.push("-5 puntos por recibir un item.");
                    }
                });
                prioridad += penalizacionItems;
            }
        
            jugador.desglosePrio = {
                puntosPorDesecrated: puntos,
                puntosPorAsistencia: prioPorAsistencia,
                penalizacionPorItems: penalizacionItems,
                prioridadFinal: prioridad,
                detalles: detalles
            };
        
            return { ...jugador, prioridad };
        });        

        jugadoresConPrioridad.sort((a, b) => b.prioridad - a.prioridad);

        res.json(jugadoresConPrioridad);

    } catch (error) {
        console.error('Error al organizar prioridades de los jugadores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const generarInforme = async (req, res) => {
    console.log("Generando informe...");

    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT j.nombre AS nombreJugador, 
                    j.clase, 
                    j.rol, 
                    i.nombre AS nombreItem, 
                    ai.note AS notaRoll, 
                    ai.respuesta
            FROM asignacion_items ai 
            JOIN jugadores j ON j.player_id = ai.player_id
            JOIN items i ON i.item_id = ai.item_id
            order by j.nombre`
        );

        // Verificar si la consulta devuelve datos
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron jugadores ni ítems' });
        }

        // Crear el documento PDF usando jsPDF
        const doc = new jsPDF();

        // Agregar título
        doc.setFontSize(16);
        doc.text('Informe de Reparto de Ítems', 20, 20);
        doc.setFontSize(12);
        doc.text('Informe de jugadores y sus ítems asignados:', 20, 30);
        doc.text('Fecha de generación: ' + new Date().toLocaleString(), 20, 40);
        doc.text('', 20, 50);  // Espacio en blanco

        // Definir las cabeceras de la tabla
        const columns = [
            'Nombre Jugador', 'Clase', 'Rol', 
            'Nombre Item', 'Nota Roll', 'Respuesta'
        ];

        // Mapear los resultados de la base de datos a las filas de la tabla
        const rows = result.rows.map(row => {
            const respuesta = row.respuesta || 'N/A';

            // Si la respuesta es "BiS", cambiar color de fondo de la celda
            const respuestaStyle = respuesta === 'BiS' ? { fillColor: [0, 255, 0] } : {};

            return [
                row.nombrejugador,
                row.clase,
                row.rol,
                row.nombreitem || 'N/A',
                row.notaroll || 'N/A',
                { content: respuesta, styles: respuestaStyle }
            ];
        });

        // Contar el total de ítems
        const totalItems = rows.length;

        // Crear la tabla usando autoTable
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 60,  // Comienza la tabla a partir de esta posición Y
            theme: 'grid',
            headStyles: {
                fillColor: [22, 160, 133],  // Color de fondo para las cabeceras
                textColor: 255,              // Color del texto en las cabeceras
                fontSize: 12
            },
            margin: { top: 10 },
            styles: { fontSize: 10 },
        });

        // Agregar la fila con el total de ítems
        doc.setFontSize(12);
        doc.text(`Total de ítems entregados: ${totalItems}`, 20, doc.lastAutoTable.finalY + 10);

        // Establecer las cabeceras para la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=informe_reparto.pdf');

        // Generar el PDF y devolverlo al cliente
        const pdfBuffer = doc.output('arraybuffer'); // Usar arraybuffer para enviar en respuesta
        res.send(Buffer.from(pdfBuffer)); // Enviar el buffer como respuesta

        console.log("Informe generado correctamente");

    } catch (err) {
        console.error("Error al generar el informe:", err);
        res.status(500).send('Error al generar el informe.');
    } finally {
        client.release();  // Liberar la conexión después de usarla
    }
};



module.exports = { generarInforme, organizarPrioridadesController, obtenerJugadoresController, obtenerItemsTotalesPorJugadorController, obtenerItemsPorJugadorController };