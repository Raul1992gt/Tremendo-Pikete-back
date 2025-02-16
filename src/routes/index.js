const express = require('express');
const multer = require('multer');
const { organizarPrioridadesController, obtenerJugadoresController, obtenerItemsTotalesPorJugadorController, obtenerItemsPorJugadorController } = require('../controllers/jugadoresController');
const { loginUserController } = require('../controllers/authController');
const { obtenerItemsPorId } = require('../controllers/itemsController')
const { procesarRaid } = require('../controllers/cargaRaid')
const upload = multer({dest: 'uploads/'});

const router = express.Router();

// Ruta para obtener los jugadores
router.get('/jugadores', obtenerJugadoresController);

// Ruta para obtener los jugadores con la cantidad de ítems recibidos
router.get('/jugadores/itemsTotales', obtenerItemsTotalesPorJugadorController); 

// Ruta para obtener la prioridad del loot
router.get('/jugadores/prioLooteo', organizarPrioridadesController)

// Ruta para obtener los ítems de un jugador específico (usando playerId)
router.get('/jugadores/items/:id', obtenerItemsPorJugadorController)

// Ruta para el login
router.post('/login', loginUserController);

// Ruta para traer los items por id
router.get('/items/:id', obtenerItemsPorId);

// Ruta para cargar un raid (roster)
router.post('/cargarRaid', upload.single('file'), procesarRaid);

module.exports = router;
