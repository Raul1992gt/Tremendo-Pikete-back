const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

module.exports = authMiddleware;

/*
Ejemplo:
const authMiddleware = require('../middlewares/authMiddleware');
router.get('/jugadores', authMiddleware, obtenerJugadoresController);

*/