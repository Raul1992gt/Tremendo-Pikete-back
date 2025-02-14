// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const { Client } = require('pg');

// settings
const port = 3000;
app.set('port', port);

// middlewares
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', (req, res) => {
    res.send('Bienvenidos a Tremendo Pikete');
});

// Database connection function
const obtenerJugadores = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    await client.connect();    
    const res = await client.query("SELECT * FROM jugadores");
    const result = res.rows;    
    await client.end();

    return result;
};

obtenerJugadores().then((result) => { 
    console.log(result);
});

app.listen(app.get('port'), () => {
    console.log(`Aplicación corriendo en el puerto ${app.get('port')}`);
});
