const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Controlador para el login
async function loginUserController(req, res) {
  const { nombre_usuario, contrasena } = req.body;

  try {
    const token = await loginUser(nombre_usuario, contrasena);
    res.status(200).json({ token });  // Devuelve el token JWT
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Lógica para verificar el login
async function loginUser(nombre_usuario, contrasena) {
    // Conectar a la base de datos para obtener el usuario y su rol
    const client = await pool.connect();
    try {
      const result = await client.query(`
          select u.contrasena, u.nombre_usuario, ur.rol_id 
          from usuarios u
          join usuario_roles ur on u.id = ur.usuario_id 
          where UPPER(u.nombre_usuario) = UPPER($1)`, [nombre_usuario]);  // Usamos el parámetro $1 para el nombre_usuario
  
      const usuario = result.rows[0];  // Obtener el primer resultado
  
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
  
      // Verificar la contraseña
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!contrasenaValida) {
        throw new Error('Contraseña incorrecta');
      }
  
      // Generar el token JWT con el id, nombre de usuario y rol del usuario
      const token = jwt.sign({
        nombre_usuario: usuario.nombre_usuario,
        rol_id:usuario.rol_id === 1 ? 'admin' :
              usuario.rol_id === 2 ? 'oficial' : 
              usuario.rol_id === 3 ? 'raider' : 'unknown'
      }, 'secreto', { expiresIn: '1h' });
  
      return token;
    } catch (err) {
      console.error(err);
      throw new Error('Error al autenticar al usuario');
    } finally {
      client.release();
    }
  }
  

module.exports = { loginUserController };