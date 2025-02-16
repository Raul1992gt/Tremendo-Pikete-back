const express = require('express');
const router = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; 

app.use(cors());                    // Habilitamos CORS
app.use(bodyParser.json());         // Parseamos el body como JSON

// Usamos las rutas
app.use('/api', router);            // Todas las rutas empezarán con /api

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
