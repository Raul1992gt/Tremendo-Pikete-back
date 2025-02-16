require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes');  

const app = express();
const port = process.env.PORT || 3000; 

// Configurar CORS con la URL del frontend desde las variables de entorno
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(bodyParser.json());  // Parseamos el body como JSON

// Usamos las rutas
app.use('/api', router);  // Todas las rutas empezarán con /api

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
