const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


const app = express();
const PORT = 3000;

// Configuración de la conexión a la base de datos
const config = {
  user: 'GermanXd135_SQLLogin_1',
  password: '94p4ef2p5o',
  server: 'DailySync.mssql.somee.com',
  database: 'DailySync',
  options: {
    encrypt: true, // Es importante establecer esto en true para conexiones seguras
    trustServerCertificate: true // Aceptar certificados autofirmados

  }
};

// Middleware para parsear el body de las solicitudes
app.use(bodyParser.json());
// Middleware para permitir CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Usuarios');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
});

// Ruta para obtener todas las actividades
app.get('/actividades', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Actividad');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).send('Error al obtener actividades');
  }
});

// Ruta para actualizar un usuario existente
// Ruta para actualizar un usuario existente
app.put('/usuarios/:id', async (req, res) => {
  const id = req.params.id;
  const { Usuario, Contraseña, Correo } = req.body;

  try {
    // Encriptar la contraseña antes de actualizarla
    const hashedContraseña = await bcrypt.hash(Contraseña, 10); // 10 es el costo de hashing

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('ID', sql.Int, id)
      .input('Usuario', sql.VarChar(50), Usuario)
      .input('Contraseña', sql.VarChar(100), hashedContraseña) // Enviar la contraseña encriptada
      .input('Correo', sql.VarChar(100), Correo)
      .query('UPDATE Usuarios SET Usuario = @Usuario, Contraseña = @Contraseña, Correo = @Correo WHERE ID = @ID');

    res.status(200).send('Usuario actualizado exitosamente.');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send('Error al actualizar usuario.');
  }
});


// Ruta para actualizar una actividad existente
app.put('/Act/:id', async (req, res) => {
  const id = req.params.id;
  const { UsuarioID, Descripcion, Importancia, FechaTermino, Titulo } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('ID', sql.Int, id)
      .input('UsuarioID', sql.Int, UsuarioID)
      .input('Descripcion', sql.Text, Descripcion)
      .input('Importancia', sql.TinyInt, Importancia)
      .input('FechaTermino', sql.Date, FechaTermino)
      .input('Titulo', sql.VarChar(100), Titulo)
      .query('UPDATE Actividad SET UsuarioID = @UsuarioID, Descripcion = @Descripcion, Importancia = @Importancia, FechaTermino = @FechaTermino, Titulo = @Titulo WHERE ID = @ID');

    res.status(200).send('Actividad actualizada exitosamente.');
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).send('Error al actualizar actividad.');
  }
});



// Ruta para obtener una actividad por IDUser
app.get('/actividades/:id', async (req, res) => {
  try {
      const pool = await sql.connect(config);
      const id = parseInt(req.params.id); // Obtén el ID de los parámetros de la ruta
      const result = await pool.request().query(`SELECT * FROM Actividad WHERE UsuarioID = ${id}`);
      
      if (result.recordset.length === 0) {
          return res.status(404).json({ mensaje: 'Actividad no encontrada' });
      }
      
      res.json(result); // Devuelve la primera actividad encontrada
  } catch (error) {
      console.error('Error al obtener actividad por ID:', error);
      res.status(500).send('Error al obtener actividad por ID');
  }
});
// Ruta para obtener una actividad por ID
app.get('/actividad/:id', async (req, res) => {
  try {
      const pool = await sql.connect(config);
      const id = parseInt(req.params.id); // Obtén el ID de los parámetros de la ruta
      const result = await pool.request().query(`SELECT * FROM Actividad WHERE ID = ${id}`);
      
      if (result.recordset.length === 0) {
          return res.status(404).json({ mensaje: 'Actividad no encontrada' });
      }
      
      res.json(result); // Devuelve la primera actividad encontrada
  } catch (error) {
      console.error('Error al obtener actividad por ID:', error);
      res.status(500).send('Error al obtener actividad por ID');
  }
});
// Ruta para obtener una usuario por ID
app.get('/usuario/:id', async (req, res) => {
  try {
      const pool = await sql.connect(config);
      const id = parseInt(req.params.id); // Obtén el ID de los parámetros de la ruta
      const result = await pool.request().query(`SELECT * FROM Usuarios WHERE ID = ${id}`);
      
      if (result.recordset.length === 0) {
          return res.status(404).json({ mensaje: 'Actividad no encontrada' });
      }
      
      res.json(result); // Devuelve la primera actividad encontrada
  } catch (error) {
      console.error('Error al obtener actividad por ID:', error);
      res.status(500).send('Error al obtener actividad por ID');
  }
});


/// Ruta para registrar un nuevo usuario
app.post('/CreateUser', async (req, res) => {
    const { Usuario, Contraseña, Correo } = req.body;
    if (!Usuario || !Contraseña || !Correo) {
      return res.status(400).send('Todos los campos son requeridos.');
    }
  
    try {
      // Generar el hash de la contraseña
      const hashedContraseña = await bcrypt.hash(Contraseña, 10); // 10 es el costo de hashing
      
      // Guardar el usuario en la base de datos junto con la contraseña encriptada
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('Usuario', sql.VarChar(50), Usuario)
        .input('Contraseña', sql.VarChar(100), hashedContraseña) // Almacenar la contraseña encriptada
        .input('Correo', sql.VarChar(100), Correo)
        .query('INSERT INTO Usuarios (Usuario, Contraseña, Correo, FechaCreacion) VALUES (@Usuario, @Contraseña, @Correo, GETDATE())');
      
      res.status(201).send('Usuario registrado exitosamente.');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).send('Error al registrar usuario.');
    }
});
  
  // Ruta para registrar una nueva actividad
  app.post('/RegAct', async (req, res) => {
    const { UsuarioID, Descripcion, Importancia, FechaTermino, Titulo } = req.body;
    if (!UsuarioID || !Descripcion || !Importancia || !FechaTermino || !Titulo) {
      return res.status(400).send('Todos los campos son requeridos.');
    }
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('UsuarioID', sql.Int, UsuarioID)
        .input('Descripcion', sql.Text, Descripcion)
        .input('Importancia', sql.TinyInt, Importancia)
        .input('FechaTermino', sql.Date, FechaTermino)
        .input('Titulo', sql.VarChar(100), Titulo)
        .query('INSERT INTO Actividad (UsuarioID, Descripcion, Importancia, FechaTermino, Titulo) VALUES (@UsuarioID, @Descripcion, @Importancia, @FechaTermino, @Titulo)');
      
      res.status(201).send('Actividad registrada exitosamente.');
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      res.status(500).send('Error al registrar actividad.');
    }
  });

  //login
// Ruta para realizar el login
app.post('/login', async (req, res) => {
    const { Usuario, Contraseña } = req.body;
    if (!Usuario || !Contraseña) {
      return res.status(400).send('El usuario y la contraseña son requeridos.');
    }
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('Usuario', sql.VarChar(50), Usuario)
        .query('SELECT * FROM Usuarios WHERE Usuario = @Usuario');
      
      const user = result.recordset[0];
      if (!user) {
        return res.status(404).send('Usuario no encontrado.');
      }
  
      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(Contraseña, user.Contraseña);
      if (!passwordMatch) {
        return res.status(401).send('Credenciales inválidas.');
      }
  
      // Generar el token JWT
      const token = jwt.sign({ ID: user.ID, Usuario: user.Usuario }, 'secreto', { expiresIn: '1h' });
  
      // Enviar el token como respuesta
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ message: 'Login exitoso.', token, ID: user.ID, Usuario: user.Usuario });
    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).send('Error en el login.');
    }
  });
  
  // Ruta protegida, ejemplo de cómo acceder a una ruta protegida
  app.get('/ruta-protegida', (req, res) => {
    // Verificar si el token está presente en las cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Token no proporcionado.');
    }
  
    // Verificar el token
    jwt.verify(token, 'secreto', (err, decoded) => {
      if (err) {
        return res.status(403).send('Token inválido.');
      }
      // El token es válido, puedes realizar acciones en esta ruta protegida
      const ID = decoded.ID;
      res.send(`¡Bienvenido! Tu ID de usuario es ${ID}.`);
    });
  });


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
