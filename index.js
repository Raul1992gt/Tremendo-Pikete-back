const express = require('express');
const app = express();
const path = require('path')
const port = 3000;

// settings
app.set('port', port)

// middlewares
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.get('/', (req, res) => {
    res.send('Bienvenidos a Tremendo Pikete')
})

app.listen(app.get('port'), () => {
    console.log(`Aplicación corriendo en el puerto ${app.get('port')}`)
})
